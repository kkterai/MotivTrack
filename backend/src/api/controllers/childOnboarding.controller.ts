import { Response } from 'express';
import { ChildOnboardingService } from '../../services/childOnboarding.service.js';
import { AuthRequest } from '../../types/index.js';

export class ChildOnboardingController {
  /**
   * Complete child onboarding
   * POST /api/child-onboarding/complete
   */
  static async completeOnboarding(req: AuthRequest, res: Response) {
    try {
      const { categories, otherCategory, specificReward } = req.body;
      const userId = req.user!.id;

      // Get child profile ID from user
      // For now, we'll need to find the child profile associated with this user
      // TODO: Add childProfileId to User model or get it from the invitation
      
      // Temporary: Get child profile by looking for one where the user was invited
      const invitation = await import('../../config/database.js').then(m => m.default.invitation.findFirst({
        where: {
          acceptedBy: userId,
          role: 'child',
        },
        include: {
          childProfile: true,
        },
      }));

      if (!invitation || !invitation.childProfileId) {
        return res.status(400).json({
          success: false,
          error: 'No child profile found for this user',
        });
      }

      const result = await ChildOnboardingService.completeOnboarding({
        childProfileId: invitation.childProfileId,
        categories,
        otherCategory,
        specificReward,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[ChildOnboardingController.completeOnboarding] Error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get onboarding status
   * GET /api/child-onboarding/status
   */
  static async getOnboardingStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Get child profile ID from invitation
      const invitation = await import('../../config/database.js').then(m => m.default.invitation.findFirst({
        where: {
          acceptedBy: userId,
          role: 'child',
        },
      }));

      if (!invitation || !invitation.childProfileId) {
        return res.status(400).json({
          success: false,
          error: 'No child profile found for this user',
        });
      }

      const status = await ChildOnboardingService.getOnboardingStatus(invitation.childProfileId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('[ChildOnboardingController.getOnboardingStatus] Error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
