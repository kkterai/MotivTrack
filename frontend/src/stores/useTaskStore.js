import { create } from 'zustand';
import { taskService } from '../services/tasks';
import { claimService } from '../services/claims';

export const useTaskStore = create((set, get) => ({
  // State
  tasks: [],
  claims: [],
  pendingClaims: [],
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  fetchTasks: async (childProfileId, activeOnly = true) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasksByChild(childProfileId, activeOnly);
      set({ tasks, isLoading: false });
      return tasks;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await taskService.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, task],
        isLoading: false,
      }));
      return task;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTask: async (taskId, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        isLoading: false,
      }));
      return updatedTask;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchTaskStats: async (childProfileId) => {
    try {
      const stats = await taskService.getTaskStats(childProfileId);
      set({ stats });
      return stats;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Claim actions
  createClaim: async (claimData) => {
    set({ isLoading: true, error: null });
    try {
      const claim = await claimService.createClaim(claimData);
      set((state) => ({
        claims: [...state.claims, claim],
        isLoading: false,
      }));
      return claim;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  verifyClaim: async (claimId, verificationData) => {
    set({ isLoading: true, error: null });
    try {
      const claim = await claimService.verifyClaim(claimId, verificationData);
      set((state) => ({
        claims: state.claims.map((c) => (c.id === claimId ? claim : c)),
        pendingClaims: state.pendingClaims.filter((c) => c.id !== claimId),
        isLoading: false,
      }));
      return claim;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchPendingClaims: async () => {
    set({ isLoading: true, error: null });
    try {
      const claims = await claimService.getPendingClaims();
      set({ pendingClaims: claims, isLoading: false });
      return claims;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchClaimsByChild: async (childProfileId, status = null) => {
    set({ isLoading: true, error: null });
    try {
      const claims = await claimService.getClaimsByChild(childProfileId, status);
      set({ claims, isLoading: false });
      return claims;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
