import api from './api';

export const claimService = {
  /**
   * Create a new claim (child marks task complete)
   */
  async createClaim(data) {
    console.log('claimService.createClaim called with:', data);
    try {
      const response = await api.post('/claims', data);
      console.log('claimService.createClaim response:', response.data);
      return response.data;
    } catch (error) {
      console.error('claimService.createClaim error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verify a claim (parent approves/requests redo)
   */
  async verifyClaim(claimId, data) {
    const response = await api.put(`/claims/${claimId}/verify`, data);
    return response.data;
  },

  /**
   * Get pending claims for parent review
   */
  async getPendingClaims() {
    const response = await api.get('/claims/pending');
    return response.data;
  },

  /**
   * Get claims for a child
   */
  async getClaimsByChild(childProfileId, status = null) {
    const response = await api.get(`/claims/child/${childProfileId}`, {
      params: status ? { status } : {},
    });
    return response.data;
  },
};
