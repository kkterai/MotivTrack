import { create } from 'zustand';
import { pointService } from '../services/points';

export const usePointStore = create((set, get) => ({
  // State
  balance: 0,
  history: [],
  metrics: null,
  isLoading: false,
  error: null,

  // Actions
  fetchBalance: async (childProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const balance = await pointService.getBalance(childProfileId);
      set({ balance, isLoading: false });
      return balance;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchHistory: async (childProfileId, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const history = await pointService.getHistory(childProfileId, limit);
      set({ history, isLoading: false });
      return history;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchMetrics: async (childProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const metrics = await pointService.getMetrics(childProfileId);
      set({ 
        metrics,
        balance: metrics.totalPoints, // Update balance from metrics
        isLoading: false 
      });
      return metrics;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Optimistic update for balance (when claim is verified)
  addPoints: (amount) => {
    set((state) => ({ balance: state.balance + amount }));
  },

  // Optimistic update for balance (when reward is redeemed)
  deductPoints: (amount) => {
    set((state) => ({ balance: state.balance - amount }));
  },

  clearError: () => set({ error: null }),
}));
