import api from './api';

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(data) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  /**
   * Get all tasks for a child
   */
  async getTasksByChild(childProfileId, activeOnly = true) {
    const response = await api.get(`/tasks/child/${childProfileId}`, {
      params: { activeOnly },
    });
    return response.data;
  },

  /**
   * Get task by ID
   */
  async getTaskById(taskId) {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Update a task
   */
  async updateTask(taskId, data) {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Get task statistics for a child
   */
  async getTaskStats(childProfileId) {
    const response = await api.get(`/tasks/child/${childProfileId}/stats`);
    return response.data;
  },
};
