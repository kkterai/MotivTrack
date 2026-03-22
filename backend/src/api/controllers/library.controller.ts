import { Request, Response } from 'express';
import { LibraryService } from '../../services/library.service';

export class LibraryController {
  /**
   * Browse library tasks
   * GET /api/library
   */
  static async browseTasks(req: Request, res: Response) {
    try {
      const { category } = req.query;

      const tasks = await LibraryService.browseTasks(category as any);

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
   * Get library task by ID
   * GET /api/library/:id
   */
  static async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const task = await LibraryService.getTaskById(id);

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
   * Seed library with default tasks
   * POST /api/library/seed
   */
  static async seedLibrary(req: Request, res: Response) {
    try {
      const result = await LibraryService.seedLibrary();

      res.status(200).json({
        success: true,
        message: result.message,
        count: result.count,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
