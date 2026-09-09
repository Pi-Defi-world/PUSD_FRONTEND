import { create } from 'zustand';
import { Transaction } from '@/types';
import { apiClient } from '@/lib/api/client';

interface TransactionState {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  pendingTx: Transaction | null;
  txHistory: Transaction[];
  lastError: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addPendingTransaction: (transaction: Transaction) => void;
  removePendingTransaction: (id: string) => void;
  setPendingTx: (tx: Transaction | null) => void;
  addToHistory: (tx: Transaction) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  clearTransactions: () => void;
  mintPUSD: (amount: number, walletAddress: string, secretSeed: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  redeemPUSD: (amount: number, walletAddress: string, secretSeed: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  fetchTransactionHistory: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  pendingTransactions: [],
  pendingTx: null,
  txHistory: [],
  lastError: null,
  isLoading: false,
  error: null,
  
  addTransaction: (transaction) => 
    set((state) => ({ 
      transactions: [transaction, ...state.transactions],
      pendingTransactions: state.pendingTransactions.filter(t => t.id !== transaction.id)
    })),
  
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ),
      pendingTransactions: state.pendingTransactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  
  addPendingTransaction: (transaction) =>
    set((state) => ({
      pendingTransactions: [...state.pendingTransactions, transaction]
    })),
  
  removePendingTransaction: (id) =>
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter(t => t.id !== id)
    })),

  setPendingTx: (tx) => set({ pendingTx: tx }),
  
  addToHistory: (tx) =>
    set((state) => ({
      txHistory: [tx, ...state.txHistory]
    })),
  
  setError: (error) => set({ error, lastError: error }),
  
  clearError: () => set({ error: null, lastError: null }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearTransactions: () => set({ transactions: [], pendingTransactions: [], error: null }),
  
  mintPUSD: async (amount, walletAddress, secretSeed) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.mint({ amount, walletAddress, secretSeed });
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Mint transaction failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  redeemPUSD: async (amount, walletAddress, secretSeed) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.redeem({ amount, walletAddress, secretSeed });
      set({ isLoading: false });
      return response;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Redeem transaction failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  fetchTransactionHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getTransactionHistory();
      if (response.success) {
        set({ 
          transactions: response.data as Transaction[], 
          isLoading: false,
          error: null 
        });
      } else {
        set({ error: response.error || 'Failed to fetch transaction history', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch transaction history', 
        isLoading: false 
      });
    }
  },
}));
