import { create } from 'zustand';
import { notificationService } from '../services/notifications';

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  ner: null,
  isLoading: false,
  error: null,

  // Actions
  fetchNotifications: async (limit = 50, unreadOnly = false) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await notificationService.getNotifications(limit, unreadOnly);
      const unreadCount = notifications.filter((n) => !n.openedAt).length;
      set({ notifications, unreadCount, isLoading: false });
      return notifications;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  markAsOpened: async (notificationId) => {
    try {
      const notification = await notificationService.markAsOpened(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? notification : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      return notification;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchNER: async () => {
    try {
      const ner = await notificationService.calculateNER();
      set({ ner });
      return ner;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Add a notification optimistically (for real-time updates)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  clearError: () => set({ error: null }),
}));
