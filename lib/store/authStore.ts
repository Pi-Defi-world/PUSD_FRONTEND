import { create } from 'zustand';
import { User, AuthResponseData } from '@/types';
import { apiClient } from '@/lib/api/client';
import { idbGet, idbSet, idbHas, STORES } from '@/lib/storage/idb';
import { generateAesKey, aesEncrypt, aesDecrypt, exportCryptoKey, importRawAesKey } from '@/lib/crypto/client-crypto';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Pi Authentication
  signInWithPi: (authResult: { accessToken: string; user: { uid: string; username: string } }) => Promise<{ success: boolean; data?: AuthResponseData; error?: string }>;
  
  // Wallet Import
  importWallet: (userId: string, mnemonic: string) => Promise<{ success: boolean; data?: { publicKey: string; secret: string }; error?: string }>;
  
  // Wallet Operations
  retrieveKeypairForTransaction: (walletAddress: string) => Promise<{ walletAddress: string; secretSeed: string }>;
  hasWalletInIndexedDB: (walletAddress: string) => Promise<boolean>;
  saveWalletLocally: (walletAddress: string, secretSeed: string) => Promise<{ success: boolean; error?: string }>;
  reImportWallet: (walletAddress: string, passphrase: string) => Promise<{ success: boolean; error?: string }>;
  verifyPassphrase: (username: string, passphrase: string) => Promise<{ success: boolean; data?: { walletAddress: string }; error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  
    setUser: (user) => set({ user }),
    setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      set({ user: null, isAuthenticated: false, error: null });
    },
  
    // Pi Authentication
    signInWithPi: async (authResult) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.signIn(authResult);
        if (response.success && (response.data as AuthResponseData)?.user) {
          const authData = response.data as AuthResponseData;
          // Store JWT token if provided
          if (authData.token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', authData.token);
          }
          set({ 
            user: authData.user!, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } else {
          set({ error: (response as { error?: string }).error || 'Sign-in failed', isLoading: false });
        }
        return response as { success: boolean; data?: AuthResponseData; error?: string };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Sign-in failed', 
          isLoading: false 
        });
        throw error;
      }
    },
  
  // Wallet Import
  importWallet: async (userId, mnemonic) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.importAccount({ mnemonic });
      set({ isLoading: false });
      return {
        success: response.success,
        data: response.data as { publicKey: string; secret: string } | undefined,
        error: (response as { error?: string }).error,
      };
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Wallet import failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
    // Wallet Operations
    hasWalletInIndexedDB: async (walletAddress: string): Promise<boolean> => {
      try {
        const hasSeed = await idbHas(STORES.ENCRYPTED_SEEDS, walletAddress);
        const hasKey = await idbHas(STORES.AES_KEYS, walletAddress);
        return hasSeed && hasKey;
      } catch {
        return false;
      }
    },

    saveWalletLocally: async (walletAddress: string, secretSeed: string): Promise<{ success: boolean; error?: string }> => {
      set({ isLoading: true, error: null });
      try {
        // Generate new AES key and encrypt seed
        const aesKey = await generateAesKey();
        const { ciphertext, iv } = await aesEncrypt(aesKey, secretSeed);
        const rawAesKey = await exportCryptoKey(aesKey);

        // Store in IndexedDB
        await idbSet(STORES.ENCRYPTED_SEEDS, walletAddress, {
          ciphertext: Array.from(ciphertext),
          iv: Array.from(iv),
        });
        await idbSet(STORES.AES_KEYS, walletAddress, Array.from(rawAesKey));

        set({ isLoading: false });
        return { success: true };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save wallet locally';
        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }
    },

    reImportWallet: async (walletAddress: string, passphrase: string): Promise<{ success: boolean; error?: string }> => {
      set({ isLoading: true, error: null });
      try {
        // Derive seed from passphrase
        const response = await fetch('/api/passphrase/derive-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passphrase }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to derive wallet from passphrase');
        }

        const { walletAddress: derivedWalletAddress, secretSeed } = await response.json();

        // Verify wallet address matches
        if (derivedWalletAddress !== walletAddress) {
          throw new Error('Passphrase does not match this wallet address');
        }

        const result = await useAuthStore.getState().saveWalletLocally(walletAddress, secretSeed);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to re-import wallet';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        return { success: false, error: errorMessage };
      }
    },

    retrieveKeypairForTransaction: async (walletAddress): Promise<{ walletAddress: string; secretSeed: string }> => {
      set({ isLoading: true, error: null });
      try {
        // First, check if wallet exists in IndexedDB (client-side storage)
        const hasWallet = await idbHas(STORES.ENCRYPTED_SEEDS, walletAddress);
        
        if (hasWallet) {
          // Use client-side stored wallet
          const encryptedSeed = await idbGet<{ ciphertext: number[]; iv: number[] }>(STORES.ENCRYPTED_SEEDS, walletAddress);
          const rawAesKey = await idbGet<number[]>(STORES.AES_KEYS, walletAddress);

          if (!encryptedSeed || !rawAesKey) {
            throw new Error('WALLET_NOT_FOUND: Wallet data not found in this device. Please re-import with your 24-word passphrase.');
          }

          // Import AES key and decrypt seed
          const aesKey = await importRawAesKey(new Uint8Array(rawAesKey));
          const ciphertext = new Uint8Array(encryptedSeed.ciphertext);
          const iv = new Uint8Array(encryptedSeed.iv);
          const secretSeed = await aesDecrypt(aesKey, ciphertext, iv);
          
          set({ isLoading: false });
          return { walletAddress, secretSeed };
        } else {
          throw new Error('WALLET_NOT_FOUND_LOCAL: Wallet not found in this device. Please re-import with your 24-word passphrase.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve keypair';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        throw err;
      }
    },

    verifyPassphrase: async (username, passphrase) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.verifyPassphrase(username, passphrase);
        set({ isLoading: false });
        return {
          success: response.success,
          data: response.data as { walletAddress: string } | undefined,
          error: (response as { error?: string }).error,
        };
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Passphrase verification failed', 
          isLoading: false 
        });
        throw error;
      }
    },
  };
});
