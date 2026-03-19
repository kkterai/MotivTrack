import api from './api';
import { STORAGE_KEYS } from '../utils/constants';

export const authService = {
  /**
   * Register a new user
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.success && response.data.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile() {
    const response = await api.get('/auth/me');
    if (response.success) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data));
    }
    return response.data;
  },

  /**
   * Update password
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/password', {
      currentPassword,
      newPassword,
    });
    return response;
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Get stored user data
   */
  getStoredUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
