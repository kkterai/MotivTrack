import { create } from 'zustand';
import { authService } from '../services/auth';

export const useAuthStore = create((set, get) => ({
  // State
  user: authService.getStoredUser(),
  token: authService.getStoredToken(),
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(userData);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, error: null });
  },

  updateProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.getProfile();
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updatePassword(currentPassword, newPassword);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Getters
  isAuthenticated: () => get().token !== null,
  isParent: () => {
    const user = get().user;
    return user?.role === 'admin_parent' || user?.role === 'delivery_parent';
  },
  isAdminParent: () => get().user?.role === 'admin_parent',
  isChild: () => get().user?.role === 'child',
  isTeacher: () => get().user?.role === 'teacher',
}));
