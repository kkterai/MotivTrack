import api from './api';

export const libraryService = {
  /**
   * Browse library tasks
   */
  async browseTasks(category = null) {
    const response = await api.get('/library', {
      params: category ? { category } : {},
    });
    return response.data;
  },

  /**
   * Get library task by ID
   */
  async getTaskById(taskId) {
    const response = await api.get(`/library/${taskId}`);
    return response.data;
  },

  /**
   * Seed library with default tasks (development only)
   */
  async seedLibrary() {
    const response = await api.post('/library/seed');
    return response;
  },
};
