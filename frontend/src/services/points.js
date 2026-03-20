import api from './api';

export const pointService = {
  /**
   * Get point balance for a child
   */
  async getBalance(childProfileId) {
    const response = await api.get(`/points/child/${childProfileId}/balance`);
    return response.data.balance;
  },

  /**
   * Get point transaction history
   */
  async getHistory(childProfileId, limit = 50) {
    const response = await api.get(`/points/child/${childProfileId}/history`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get point metrics
   */
  async getMetrics(childProfileId) {
    const response = await api.get(`/points/child/${childProfileId}/metrics`);
    return response.data;
  },

  /**
   * Award welcome bonus points to a child
   */
  async awardWelcomeBonus(childProfileId, amount) {
    const response = await api.post(`/points/child/${childProfileId}/welcome-bonus`, {
      amount,
    });
    return response.data;
  },
};
