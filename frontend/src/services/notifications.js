import api from './api';

export const notificationService = {
  /**
   * Get notifications for current user
   */
  async getNotifications(limit = 50, unreadOnly = false) {
    const response = await api.get('/notifications', {
      params: { limit, unreadOnly },
    });
    return response.data;
  },

  /**
   * Mark notification as opened
   */
  async markAsOpened(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/open`);
    return response.data;
  },

  /**
   * Calculate NER metric for current user
   */
  async calculateNER() {
    const response = await api.get('/notifications/metrics/ner');
    return response.data.ner;
  },
};
