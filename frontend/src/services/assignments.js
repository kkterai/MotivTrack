import api from './api';

/**
 * Task Assignment Service
 * Handles API calls for task assignment operations
 */
export const assignmentService = {
  /**
   * Assign a task to a specific date
   */
  async assignTask(taskId, childProfileId, assignedFor) {
    const response = await api.post('/assignments', {
      taskId,
      childProfileId,
      assignedFor,
    });
    return response; // Interceptor already extracts .data
  },

  /**
   * Assign multiple tasks at once (bulk operation)
   */
  async assignMultipleTasks(assignments) {
    const response = await api.post('/assignments/bulk', {
      assignments,
    });
    return response; // Interceptor already extracts .data
  },

  /**
   * Unassign a task from a specific date
   */
  async unassignTask(assignmentId) {
    const response = await api.delete(`/assignments/${assignmentId}`);
    return response; // Interceptor already extracts .data
  },

  /**
   * Get assignments for a specific date
   */
  async getAssignmentsForDate(childProfileId, date) {
    const response = await api.get(
      `/assignments/child/${childProfileId}/date/${date}`
    );
    return response; // Interceptor already extracts .data
  },

  /**
   * Get assignments for a date range
   */
  async getAssignmentsForDateRange(childProfileId, startDate, endDate) {
    const response = await api.get(
      `/assignments/child/${childProfileId}/range`,
      {
        params: { startDate, endDate },
      }
    );
    return response; // Interceptor already extracts .data
  },

  /**
   * Get all assignments for a child
   */
  async getChildAssignments(childProfileId) {
    const response = await api.get(`/assignments/child/${childProfileId}`);
    return response; // Interceptor already extracts .data
  },

  /**
   * Get assignment statistics for a child
   */
  async getAssignmentStats(childProfileId) {
    const response = await api.get(
      `/assignments/child/${childProfileId}/stats`
    );
    return response; // Interceptor already extracts .data
  },

  /**
   * Get unassigned tasks for a child
   */
  async getUnassignedTasks(childProfileId) {
    const response = await api.get(
      `/assignments/child/${childProfileId}/unassigned`
    );
    return response; // Interceptor already extracts .data
  },

  /**
   * Mark an assignment as completed
   */
  async markAssignmentCompleted(assignmentId) {
    const response = await api.patch(
      `/assignments/${assignmentId}/complete`
    );
    return response; // Interceptor already extracts .data
  },

  /**
   * Helper: Get today's date in ISO format (YYYY-MM-DD)
   */
  getTodayISO() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  },

  /**
   * Helper: Get tomorrow's date in ISO format (YYYY-MM-DD)
   */
  getTomorrowISO() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },

  /**
   * Helper: Format date to ISO string for API
   */
  formatDateForAPI(date) {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  },
};
