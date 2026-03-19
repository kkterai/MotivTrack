import { Response } from 'express';
import { ChildProfileService } from '../../services/childProfile.service.js';
import { AuthRequest } from '../../types/index.js';

export class ChildProfileController {
  /**
   * Create a new child profile
   * POST /api/child-profiles
   */
  static async createChildProfile(req: AuthRequest, res: Response) {
    try {
      const { name, grade, age, schoolName, schoolDomain, welcomeBonusPoints } = req.body;
      const adminParentId = req.user!.id;

      const childProfile = await ChildProfileService.createChildProfile({
        name,
        grade,
        age,
        schoolName,
        schoolDomain,
        adminParentId,
        welcomeBonusPoints,
      });

      res.status(201).json({
        success: true,
        data: childProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get child profile by ID
   * GET /api/child-profiles/:id
   */
  static async getChildProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check access
      const hasAccess = await ChildProfileService.hasAccess(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to access this child profile',
        });
      }

      const childProfile = await ChildProfileService.getChildProfileById(id);

      res.json({
        success: true,
        data: childProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all child profiles for current user
   * GET /api/child-profiles
   */
  static async getMyChildProfiles(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const childProfiles = await ChildProfileService.getChildProfilesByParent(userId);

      res.json({
        success: true,
        data: childProfiles,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update child profile
   * PUT /api/child-profiles/:id
   */
  static async updateChildProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { name, grade, schoolName, schoolDomain, deliveryParentId } = req.body;

      const childProfile = await ChildProfileService.updateChildProfile(
        id,
        { name, grade, schoolName, schoolDomain, deliveryParentId },
        userId
      );

      res.json({
        success: true,
        data: childProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Archive child profile
   * DELETE /api/child-profiles/:id
   */
  static async archiveChildProfile(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const childProfile = await ChildProfileService.archiveChildProfile(id, userId);

      res.json({
        success: true,
        data: childProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get child dashboard data
   * GET /api/child-profiles/:id/dashboard
   */
  static async getChildDashboard(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check access
      const hasAccess = await ChildProfileService.hasAccess(id, userId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to access this child profile',
        });
      }

      const dashboardData = await ChildProfileService.getChildDashboardData(id);

      res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add delivery parent to child profile
   * POST /api/child-profiles/:id/delivery-parent
   */
  static async addDeliveryParent(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { deliveryParentId } = req.body;
      const adminParentId = req.user!.id;

      const childProfile = await ChildProfileService.addDeliveryParent(
        id,
        deliveryParentId,
        adminParentId
      );

      res.json({
        success: true,
        data: childProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
