import { Request, Response } from 'express';
import { PointService } from '../../services/point.service';

export class PointController {
  /**
   * Get point balance for a child
   * GET /api/points/child/:childProfileId/balance
   */
  static async getBalance(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;

      const balance = await PointService.getPointBalance(childProfileId);

      res.status(200).json({
        success: true,
        data: { balance },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get point transaction history
   * GET /api/points/child/:childProfileId/history
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const { limit } = req.query;

      const history = await PointService.getPointHistory(
        childProfileId,
        limit ? parseInt(limit as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get point metrics
   * GET /api/points/child/:childProfileId/metrics
   */
  static async getMetrics(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;

      const metrics = await PointService.getPointMetrics(childProfileId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
