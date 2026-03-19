import { Request, Response } from 'express';
import { ClaimService } from '../../services/claim.service';

export class ClaimController {
  /**
   * Create a new claim (child marks task as complete)
   * POST /api/claims
   */
  static async createClaim(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { taskId, childProfileId, claimType } = req.body;

      const claim = await ClaimService.createClaim(
        {
          taskId,
          childProfileId,
          claimType,
        },
        userId
      );

      res.status(201).json({
        success: true,
        data: claim,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Verify a claim (parent approves/requests redo)
   * PUT /api/claims/:id/verify
   */
  static async verifyClaim(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { status, redoNote } = req.body;

      const claim = await ClaimService.verifyClaim(
        id,
        { status, redoNote },
        userId
      );

      res.status(200).json({
        success: true,
        data: claim,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get claims for a child
   * GET /api/claims/child/:childProfileId
   */
  static async getClaimsByChild(req: Request, res: Response) {
    try {
      const { childProfileId } = req.params;
      const { status } = req.query;

      const claims = await ClaimService.getClaimsByChild(
        childProfileId,
        status as any
      );

      res.status(200).json({
        success: true,
        data: claims,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get pending claims for parent review
   * GET /api/claims/pending
   */
  static async getPendingClaims(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;

      const claims = await ClaimService.getPendingClaimsForParent(userId);

      res.status(200).json({
        success: true,
        data: claims,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
