import { create } from 'zustand';
import { rewardService } from '../services/rewards';

export const useRewardStore = create((set, get) => ({
  // State
  rewards: [],
  redemptions: [],
  pendingRedemptions: [],
  rdt: null,
  isLoading: false,
  error: null,

  // Actions
  fetchRewards: async (childProfileId, activeOnly = true) => {
    set({ isLoading: true, error: null });
    try {
      const rewards = await rewardService.getRewardsByChild(childProfileId, activeOnly);
      set({ rewards, isLoading: false });
      return rewards;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createReward: async (rewardData) => {
    set({ isLoading: true, error: null });
    try {
      const reward = await rewardService.createReward(rewardData);
      set((state) => ({
        rewards: [...state.rewards, reward],
        isLoading: false,
      }));
      return reward;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateReward: async (rewardId, rewardData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedReward = await rewardService.updateReward(rewardId, rewardData);
      set((state) => ({
        rewards: state.rewards.map((r) => (r.id === rewardId ? updatedReward : r)),
        isLoading: false,
      }));
      return updatedReward;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  redeemReward: async (rewardId) => {
    set({ isLoading: true, error: null });
    try {
      const redemption = await rewardService.redeemReward(rewardId);
      set((state) => ({
        redemptions: [...state.redemptions, redemption],
        isLoading: false,
      }));
      return redemption;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchPendingRedemptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const redemptions = await rewardService.getPendingRedemptions();
      set({ pendingRedemptions: redemptions, isLoading: false });
      return redemptions;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  markAsDelivered: async (redemptionId) => {
    set({ isLoading: true, error: null });
    try {
      const redemption = await rewardService.markAsDelivered(redemptionId);
      set((state) => ({
        pendingRedemptions: state.pendingRedemptions.filter((r) => r.id !== redemptionId),
        isLoading: false,
      }));
      return redemption;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchRDT: async () => {
    try {
      const rdt = await rewardService.calculateRDT();
      set({ rdt });
      return rdt;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
