import { create } from 'zustand';
import { Stats } from '@/types';
import { apiClient } from '@/lib/api/client';

interface PriceState {
  piPrice: number | null;
  usdTestPrice: number; // Always $1.00 on testnet
  isTestnet: boolean;
  lastUpdate: Date | null;
  isLoading: boolean;
  error: string | null;
  priceHistory: Array<{ price: number; timestamp: Date }>;
  
  // Actions
  setPiPrice: (price: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPriceToHistory: (price: number) => void;
  clearPriceHistory: () => void;
  fetchPiPrice: () => Promise<void>;
}

export const usePriceStore = create<PriceState>((set, get) => {
  // Check testnet mode
  const checkTestnetMode = () => {
    const testnetMode = apiClient.isTestnetMode();
    set({ isTestnet: testnetMode });
    return testnetMode;
  };

  // Initial check
  if (typeof window !== 'undefined') {
    checkTestnetMode();
  }

  return {
    piPrice: null,
    usdTestPrice: 1.00, // Always $1.00 on testnet
    isTestnet: false,
    lastUpdate: null,
    isLoading: false,
    error: null,
    priceHistory: [],
  
  setPiPrice: (price) => {
    const isTestnet = get().isTestnet || checkTestnetMode();
    set({ 
      piPrice: price, 
      lastUpdate: new Date(),
      error: null,
      isTestnet,
    });
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  addPriceToHistory: (price) =>
    set((state) => ({
      priceHistory: [
        { price, timestamp: new Date() },
        ...state.priceHistory.slice(0, 99)  
      ]
    })),
  
  clearPriceHistory: () => set({ priceHistory: [] }),
  
  fetchPiPrice: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getPiPrice();
      if (response.success) {
        const price = (response.data as { piPrice: number }).piPrice;
        set({ 
          piPrice: price, 
          lastUpdate: new Date(), 
          isLoading: false,
          error: null 
        });
        // Add to history
        set((state) => ({
          priceHistory: [
            { price, timestamp: new Date() },
            ...state.priceHistory.slice(0, 99)
          ]
        }));
      } else {
        set({ error: response.error || 'Failed to fetch Pi price', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch Pi price', 
        isLoading: false 
      });
    }
  },
};
});

interface StatsState {
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  
  // Actions
  setStats: (stats: Stats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  lastUpdate: null,
  
  setStats: (stats) => set({ 
    stats, 
    lastUpdate: new Date(),
    error: null 
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getStats();
      if (response.success) {
        set({ 
          stats: response.data as import('@/types').Stats, 
          lastUpdate: new Date(), 
          isLoading: false,
          error: null 
        });
      } else {
        set({ error: response.error || 'Failed to fetch stats', isLoading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats', 
        isLoading: false 
      });
    }
  },
}));
