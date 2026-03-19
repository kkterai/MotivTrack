import { Request, Response } from 'express';
import { RewardService } from '../../services/reward.service';

export class RewardController {
  /**
   * Create a new reward
   * POST /api/rewards
   */
  static async createReward(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { childProfileId, title, description, pointCost } = req.body;

      console.log('[RewardController.createReward] Request:', {
        userId,
        childProfileId,
        title,
        description,
        pointCost,
      });

      const reward = await RewardService.createReward(
        {
          childProfileId,
          title,
          description,
          pointCost,
        },
        userId
      );

      console.log('[RewardController.createReward] Success:', reward.id);

      res.status(201).json({
        success: true,
        data: reward,
      });
    } catch (error: any) {
      console.error('[RewardController.createReward] Error:', error.message);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get rewards for a child
   * GET /api/rewards/child/:childProfileId
   */
  static async getRewardsByChild(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const { activeOnly } = req.query;

      const rewards = await RewardService.getRewardsByChild(
        childProfileId,
        activeOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: rewards,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update a reward
   * PUT /api/rewards/:id
   */
  static async updateReward(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const updateData = req.body;

      const reward = await RewardService.updateReward(id, updateData, userId);

      res.status(200).json({
        success: true,
        data: reward,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Redeem a reward
   * POST /api/rewards/:id/redeem
   */
  static async redeemReward(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const redemption = await RewardService.redeemReward(id, userId);

      res.status(201).json({
        success: true,
        data: redemption,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Mark reward as delivered
   * PUT /api/rewards/redemptions/:id/deliver
   */
  static async markAsDelivered(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const redemption = await RewardService.markAsDelivered(id, userId);

      res.status(200).json({
        success: true,
        data: redemption,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get pending redemptions for parent
   * GET /api/rewards/redemptions/pending
   */
  static async getPendingRedemptions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const redemptions = await RewardService.getPendingRedemptions(userId);

      res.status(200).json({
        success: true,
        data: redemptions,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Calculate RDT metric
   * GET /api/rewards/metrics/rdt
   */
  static async calculateRDT(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const rdt = await RewardService.calculateRDT(userId);

      res.status(200).json({
        success: true,
        data: { rdt },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
