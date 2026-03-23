import { Request, Response } from 'express';
import { TaskService } from '../../services/task.service';

export class TaskController {
  /**
   * Create a new task
   * POST /api/tasks
   */
  static async createTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const {
        childProfileId,
        title,
        doneStandard,
        extraWellDoneStandard,
        tips,
        pointsDone,
        pointsExtraWellDone,
        libraryTaskId
      } = req.body;

      console.log('[TaskController.createTask] userId:', userId);
      console.log('[TaskController.createTask] req.body:', req.body);

      const task = await TaskService.createTask(
        {
          childProfileId,
          title,
          doneStandard,
          extraWellDoneStandard,
          tips,
          pointsDone,
          pointsExtraWellDone,
          libraryTaskId,
        },
        userId
      );

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      console.error('[TaskController.createTask] Error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all tasks for a child
   * GET /api/tasks/child/:childProfileId
   */
  static async getTasksByChild(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const { activeOnly } = req.query;

      const tasks = await TaskService.getTasksByChild(
        childProfileId,
        activeOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  static async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const task = await TaskService.getTaskById(id);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update a task
   * PUT /api/tasks/:id
   */
  static async updateTask(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const updateData = req.body;

      const task = await TaskService.updateTask(id, updateData, userId);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get task statistics for a child
   * GET /api/tasks/child/:childProfileId/stats
   */
  static async getTaskStats(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;

      const stats = await TaskService.getTaskStats(childProfileId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get tasks assigned for a specific date (for child view)
   * GET /api/tasks/child/:childProfileId/date/:date
   */
  static async getTasksForDate(req: Request, res: Response) {
    try {
      const { childProfileId, date } = req.params;

      if (!date) {
        return res.status(400).json({
          success: false,
          error: 'Date parameter is required',
        });
      }

      const tasks = await TaskService.getTasksForDate(
        childProfileId,
        new Date(date)
      );

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
