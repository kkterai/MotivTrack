import { Request, Response } from 'express';
import { InvitationService } from '../../services/invitation.service.js';
import { AuthRequest } from '../../types/index.js';

export class InvitationController {
  /**
   * Create a new invitation
   * POST /api/invitations
   */
  static async createInvitation(req: AuthRequest, res: Response) {
    try {
      const { email, role, childProfileId } = req.body;
      const invitedBy = req.user!.id;

      const invitation = await InvitationService.createInvitation({
        email,
        role,
        invitedBy,
        childProfileId,
      });

      res.status(201).json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Validate an invitation token
   * GET /api/invitations/validate/:token
   */
  static async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const invitation = await InvitationService.validateToken(token);

      res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Accept an invitation
   * POST /api/invitations/:token/accept
   */
  static async acceptInvitation(req: AuthRequest, res: Response) {
    try {
      const { token } = req.params;
      const userId = req.user!.id;

      const invitation = await InvitationService.acceptInvitation(token, userId);

      res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Resend an invitation
   * POST /api/invitations/:id/resend
   */
  static async resendInvitation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const invitation = await InvitationService.resendInvitation(id, userId);

      res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all invitations sent by current user
   * GET /api/invitations
   */
  static async getMyInvitations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const invitations = await InvitationService.getInvitationsByUser(userId);

      res.json({
        success: true,
        data: invitations,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Cancel an invitation
   * DELETE /api/invitations/:id
   */
  static async cancelInvitation(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const invitation = await InvitationService.cancelInvitation(id, userId);

      res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
