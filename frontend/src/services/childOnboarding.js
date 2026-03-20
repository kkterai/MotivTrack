import api from './api';

export const childOnboardingService = {
  /**
   * Complete child onboarding (save preferences and award points)
   */
  async completeOnboarding(data) {
    const response = await api.post('/child-onboarding/complete', data);
    return response.data;
  },

  /**
   * Get child onboarding status
   */
  async getOnboardingStatus() {
    const response = await api.get('/child-onboarding/status');
    return response.data;
  },
};
