import { Request, Response } from 'express';
import { TaskAssignmentService } from '../../services/taskAssignment.service.js';

/**
 * TaskAssignment Controller
 * Handles HTTP requests for task assignment operations
 */
export class TaskAssignmentController {
  /**
   * POST /api/assignments
   * Assign a task to a specific date
   */
  static async assignTask(req: Request, res: Response) {
    try {
      const { taskId, childProfileId, assignedFor } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!taskId || !childProfileId || !assignedFor) {
        return res.status(400).json({
          error: 'Missing required fields: taskId, childProfileId, assignedFor',
        });
      }

      const assignment = await TaskAssignmentService.assignTask(
        taskId,
        childProfileId,
        new Date(assignedFor),
        userId
      );

      res.status(201).json(assignment);
    } catch (error) {
      console.error('[TaskAssignmentController.assignTask] Error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to assign task',
      });
    }
  }

  /**
   * POST /api/assignments/bulk
   * Assign multiple tasks at once
   */
  static async assignMultipleTasks(req: Request, res: Response) {
    try {
      const { assignments } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!assignments || !Array.isArray(assignments)) {
        return res.status(400).json({
          error: 'Missing or invalid assignments array',
        });
      }

      const result = await TaskAssignmentService.assignMultipleTasks(
        assignments.map((a) => ({
          taskId: a.taskId,
          childProfileId: a.childProfileId,
          assignedFor: new Date(a.assignedFor),
        })),
        userId
      );

      res.status(201).json(result);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.assignMultipleTasks] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Failed to assign tasks',
      });
    }
  }

  /**
   * DELETE /api/assignments/:assignmentId
   * Unassign a task
   */
  static async unassignTask(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await TaskAssignmentService.unassignTask(
        assignmentId,
        userId
      );

      res.json(result);
    } catch (error) {
      console.error('[TaskAssignmentController.unassignTask] Error:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Failed to unassign task',
      });
    }
  }

  /**
   * GET /api/assignments/child/:childProfileId/date/:date
   * Get assignments for a specific date
   */
  static async getAssignmentsForDate(req: Request, res: Response) {
    try {
      const { childProfileId, date } = req.params;

      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }

      const assignments = await TaskAssignmentService.getAssignmentsForDate(
        childProfileId,
        new Date(date)
      );

      res.json(assignments);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.getAssignmentsForDate] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignments',
      });
    }
  }

  /**
   * GET /api/assignments/child/:childProfileId/range
   * Get assignments for a date range
   */
  static async getAssignmentsForDateRange(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'startDate and endDate query parameters are required',
        });
      }

      const assignments =
        await TaskAssignmentService.getAssignmentsForDateRange(
          childProfileId,
          new Date(startDate as string),
          new Date(endDate as string)
        );

      res.json(assignments);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.getAssignmentsForDateRange] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignments',
      });
    }
  }

  /**
   * GET /api/assignments/child/:childProfileId
   * Get all assignments for a child
   */
  static async getChildAssignments(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const assignments = await TaskAssignmentService.getChildAssignments(
        childProfileId,
        userId
      );

      res.json(assignments);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.getChildAssignments] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignments',
      });
    }
  }

  /**
   * GET /api/assignments/child/:childProfileId/stats
   * Get assignment statistics for a child
   */
  static async getAssignmentStats(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;

      const stats = await TaskAssignmentService.getAssignmentStats(
        childProfileId
      );

      res.json(stats);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.getAssignmentStats] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignment stats',
      });
    }
  }

  /**
   * GET /api/assignments/child/:childProfileId/unassigned
   * Get unassigned tasks for a child
   */
  static async getUnassignedTasks(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;

      const tasks = await TaskAssignmentService.getUnassignedTasks(
        childProfileId
      );

      res.json(tasks);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.getUnassignedTasks] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get unassigned tasks',
      });
    }
  }

  /**
   * PATCH /api/assignments/:assignmentId/complete
   * Mark an assignment as completed
   */
  static async markAssignmentCompleted(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;

      const assignment = await TaskAssignmentService.markAssignmentCompleted(
        assignmentId
      );

      res.json(assignment);
    } catch (error) {
      console.error(
        '[TaskAssignmentController.markAssignmentCompleted] Error:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark assignment as completed',
      });
    }
  }
}
