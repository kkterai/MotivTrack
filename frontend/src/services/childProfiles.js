import api from './api';

export const childProfileService = {
  /**
   * Create a new child profile
   */
  async createChildProfile(data) {
    const response = await api.post('/child-profiles', data);
    return response.data;
  },

  /**
   * Get all child profiles for current user
   */
  async getMyChildProfiles() {
    const response = await api.get('/child-profiles');
    return response.data;
  },

  /**
   * Get child profile by ID
   */
  async getChildProfile(childProfileId) {
    const response = await api.get(`/child-profiles/${childProfileId}`);
    return response.data;
  },

  /**
   * Get child dashboard data
   */
  async getChildDashboard(childProfileId) {
    const response = await api.get(`/child-profiles/${childProfileId}/dashboard`);
    return response.data;
  },

  /**
   * Update child profile
   */
  async updateChildProfile(childProfileId, data) {
    const response = await api.put(`/child-profiles/${childProfileId}`, data);
    return response.data;
  },

  /**
   * Add delivery parent to child profile
   */
  async addDeliveryParent(childProfileId, deliveryParentId) {
    const response = await api.post(`/child-profiles/${childProfileId}/delivery-parent`, {
      deliveryParentId,
    });
    return response.data;
  },

  /**
   * Archive child profile
   */
  async archiveChildProfile(childProfileId) {
    const response = await api.delete(`/child-profiles/${childProfileId}`);
    return response.data;
  },
};
