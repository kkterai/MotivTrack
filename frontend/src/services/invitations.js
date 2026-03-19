import api from './api';

export const invitationService = {
  /**
   * Create a new invitation
   */
  async createInvitation(data) {
    const response = await api.post('/invitations', data);
    return response.data;
  },

  /**
   * Validate an invitation token (public - no auth required)
   */
  async validateToken(token) {
    const response = await api.get(`/invitations/validate/${token}`);
    return response.data;
  },

  /**
   * Accept an invitation
   */
  async acceptInvitation(token) {
    const response = await api.post(`/invitations/${token}/accept`);
    return response.data;
  },

  /**
   * Get all invitations sent by current user
   */
  async getMyInvitations() {
    const response = await api.get('/invitations');
    return response.data;
  },

  /**
   * Resend an invitation
   */
  async resendInvitation(invitationId) {
    const response = await api.post(`/invitations/${invitationId}/resend`);
    return response.data;
  },

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId) {
    const response = await api.delete(`/invitations/${invitationId}`);
    return response.data;
  },
};
