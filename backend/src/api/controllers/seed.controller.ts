import { Response } from 'express';
import { AuthRequest } from '../../types/index.js';
import { SeedService } from '../../services/seed.service.js';

export class SeedController {
  /**
   * Seed default tasks and rewards for a child profile
   * POST /api/seed/child/:childProfileId
   */
  static async seedChildProfile(req: AuthRequest, res: Response) {
    try {
      const { childProfileId } = req.params;
      const userId = req.user!.id;

      const result = await SeedService.seedDefaultData(childProfileId, userId);

      res.status(201).json({
        success: true,
        message: 'Default tasks and rewards seeded successfully',
        data: {
          tasksCreated: result.tasks.length,
          rewardsCreated: result.rewards.length,
        },
      });
    } catch (error: any) {
      console.error('Error seeding child profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to seed child profile',
      });
    }
  }

  /**
   * Seed default tasks only for a child profile
   * POST /api/seed/child/:childProfileId/tasks
   */
  static async seedTasks(req: AuthRequest, res: Response) {
    try {
      const { childProfileId } = req.params;
      const userId = req.user!.id;

      const tasks = await SeedService.seedDefaultTasks(childProfileId, userId);

      res.status(201).json({
        success: true,
        message: 'Default tasks seeded successfully',
        data: { tasksCreated: tasks.length, tasks },
      });
    } catch (error: any) {
      console.error('Error seeding tasks:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to seed tasks',
      });
    }
  }

  /**
   * Seed default rewards only for a child profile
   * POST /api/seed/child/:childProfileId/rewards
   */
  static async seedRewards(req: AuthRequest, res: Response) {
    try {
      const { childProfileId } = req.params;
      const userId = req.user!.id;

      const rewards = await SeedService.seedDefaultRewards(childProfileId, userId);

      res.status(201).json({
        success: true,
        message: 'Default rewards seeded successfully',
        data: { rewardsCreated: rewards.length, rewards },
      });
    } catch (error: any) {
      console.error('Error seeding rewards:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to seed rewards',
      });
    }
  }
}
