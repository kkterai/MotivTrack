import { Request, Response } from 'express';
import { NotificationService } from '../../services/notification.service';

export class NotificationController {
  /**
   * Get notifications for a user
   * GET /api/notifications
   */
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { limit, unreadOnly } = req.query;

      const notifications = await NotificationService.getNotificationsForUser(
        userId,
        limit ? parseInt(limit as string) : undefined,
        unreadOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Mark notification as opened
   * PUT /api/notifications/:id/open
   */
  static async markAsOpened(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const notification = await NotificationService.markAsOpened(id, userId);

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Calculate NER metric
   * GET /api/notifications/metrics/ner
   */
  static async calculateNER(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const role = (req as any).user.role;

      const ner = await NotificationService.calculateNER(userId, role);

      res.status(200).json({
        success: true,
        data: { ner },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
