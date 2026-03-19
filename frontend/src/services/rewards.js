import api from './api';

export const rewardService = {
  /**
   * Create a new reward
   */
  async createReward(data) {
    const response = await api.post('/rewards', data);
    return response.data;
  },

  /**
   * Get rewards for a child
   */
  async getRewardsByChild(childProfileId, activeOnly = true) {
    const response = await api.get(`/rewards/child/${childProfileId}`, {
      params: { activeOnly },
    });
    return response.data;
  },

  /**
   * Update a reward
   */
  async updateReward(rewardId, data) {
    const response = await api.put(`/rewards/${rewardId}`, data);
    return response.data;
  },

  /**
   * Redeem a reward (child earns it)
   */
  async redeemReward(rewardId) {
    const response = await api.post(`/rewards/${rewardId}/redeem`);
    return response.data;
  },

  /**
   * Get pending redemptions for parent
   */
  async getPendingRedemptions() {
    const response = await api.get('/rewards/redemptions/pending');
    return response.data;
  },

  /**
   * Mark reward as delivered
   */
  async markAsDelivered(redemptionId) {
    const response = await api.put(`/rewards/redemptions/${redemptionId}/deliver`);
    return response.data;
  },

  /**
   * Calculate RDT metric
   */
  async calculateRDT() {
    const response = await api.get('/rewards/metrics/rdt');
    return response.data.rdt;
  },
};
