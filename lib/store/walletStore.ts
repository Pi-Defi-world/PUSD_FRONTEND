import { create } from 'zustand';
import { Balance, ReserveStatus } from '@/types';
import { apiClient } from '@/lib/api/client';

interface CachedBalance {
  data: Balance;
  timestamp: number;
  ttl: number;
}

const BALANCE_TTL = 30000;

function getCachedBalance(address: string): CachedBalance | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`balance_cache:${address}`);
    if (!raw) return null;
    const cached: CachedBalance = JSON.parse(raw);
    if (Date.now() - cached.timestamp > cached.ttl) {
      localStorage.removeItem(`balance_cache:${address}`);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function setCachedBalance(address: string, data: Balance): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CachedBalance = { data, timestamp: Date.now(), ttl: BALANCE_TTL };
    localStorage.setItem(`balance_cache:${address}`, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable
  }
}

interface WalletState {
  walletAddress: string | null;
  balance: Balance | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isTestnet: boolean;
  reserveStatus: ReserveStatus | null;
  
  setWalletAddress: (address: string | null) => void;
  setBalance: (balance: Balance | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateBalance: (balance: Balance) => void;
  clearWallet: () => void;
  fetchBalance: (address: string) => Promise<void>;
  fetchEnhancedBalance: (address: string) => Promise<void>;
  fetchReserveStatus: () => Promise<void>;
}

const getPersistedWalletAddress = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('persisted_wallet_address');
  }
  return null;
};

const setPersistedWalletAddress = (address: string | null) => {
  if (typeof window !== 'undefined') {
    if (address) {
      localStorage.setItem('persisted_wallet_address', address);
    } else {
      localStorage.removeItem('persisted_wallet_address');
    }
  }
};

export const useWalletStore = create<WalletState>((set, get) => {
  const checkTestnetMode = () => {
    const testnetMode = apiClient.isTestnetMode();
    set({ isTestnet: testnetMode });
    return testnetMode;
  };

  const initialWalletAddress = getPersistedWalletAddress();
  if (typeof window !== 'undefined') {
    checkTestnetMode();
  }

  return {
    walletAddress: initialWalletAddress,
    balance: null,
    isLoading: false,
    error: null,
    lastUpdate: null,
    isTestnet: false,
    reserveStatus: null,
  
    setWalletAddress: (address) => {
      set({ walletAddress: address });
      setPersistedWalletAddress(address);
    },
    setBalance: (balance) => set({ balance, lastUpdate: new Date() }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    updateBalance: (balance) => set({ balance, lastUpdate: new Date(), error: null }),
    clearWallet: () => {
      set({
        walletAddress: null,
        balance: null,
        error: null,
        lastUpdate: null,
        reserveStatus: null,
      });
      setPersistedWalletAddress(null);
    },
  
    fetchBalance: async (address: string) => {
      const cached = getCachedBalance(address);
      if (cached) {
        set({ 
          balance: cached.data, 
          lastUpdate: new Date(cached.timestamp), 
          isLoading: false,
          error: null 
        });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.checkBalance(address);
        if (response.success) {
          const balanceData = response.data as Balance;
          setCachedBalance(address, balanceData);
          set({ 
            balance: balanceData, 
            lastUpdate: new Date(), 
            isLoading: false,
            error: null 
          });
        } else {
          set({ error: response.error || 'Failed to fetch balance', isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch balance', 
          isLoading: false 
        });
      }
    },
  
    fetchEnhancedBalance: async (address: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiClient.enhancedBalanceCheck(address);
        if (response.success) {
          const balanceData = response.data as Balance;
          setCachedBalance(address, balanceData);
          set({ 
            balance: balanceData, 
            lastUpdate: new Date(), 
            isLoading: false,
            error: null 
          });
        } else {
          set({ error: response.error || 'Failed to fetch enhanced balance', isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch enhanced balance', 
          isLoading: false 
        });
      }
    },

    fetchReserveStatus: async () => {
      const isTestnet = get().isTestnet || checkTestnetMode();
      if (!isTestnet) return;

      try {
        const response = await apiClient.getReserveStatus();
        if (response.success && response.data) {
          set({ reserveStatus: response.data as ReserveStatus });
        }
      } catch (error) {
        console.error('Failed to fetch reserve status:', error);
      }
    },
  };
});
