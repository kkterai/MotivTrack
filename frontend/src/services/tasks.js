import api from './api';

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(data) {
    // Backend returns { success, data: task }, interceptor unwraps to { success, data }
    const response = await api.post('/tasks', data);
    return response.data;
  },

  /**
   * Get all tasks for a child
   */
  async getTasksByChild(childProfileId, activeOnly = true) {
    // Backend returns { success, data: tasks[] }, interceptor unwraps to { success, data }
    const response = await api.get(`/tasks/child/${childProfileId}`, {
      params: { activeOnly },
    });
    return response.data;
  },

  /**
   * Get task by ID
   */
  async getTaskById(taskId) {
    // Backend returns { success, data: task }, interceptor unwraps to { success, data }
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Update a task
   */
  async updateTask(taskId, data) {
    // Backend returns { success, data: task }, interceptor unwraps to { success, data }
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Get task statistics for a child
   */
  async getTaskStats(childProfileId) {
    // Backend returns { success, data: stats }, interceptor unwraps to { success, data }
    const response = await api.get(`/tasks/child/${childProfileId}/stats`);
    return response.data;
  },

  /**
   * Get tasks assigned for a specific date (for child view)
   */
  async getTasksForDate(childProfileId, date) {
    // Backend returns { success, data: tasks[] }, interceptor unwraps to { success, data }
    const response = await api.get(`/tasks/child/${childProfileId}/date/${date}`);
    return response.data;
  },
};
