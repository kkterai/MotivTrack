import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { InvitationService } from '../../services/invitation.service';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      const result = await AuthService.register(
        email,
        password,
        role,
        name
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // User is attached by auth middleware
      const userId = (req as any).user.userId;

      const user = await AuthService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update password
   * PUT /api/auth/password
   */
  static async updatePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { currentPassword, newPassword } = req.body;

      await AuthService.updatePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Register child account via invitation token
   * POST /api/auth/register-child
   */
  static async registerChild(req: Request, res: Response) {
    try {
      const { token, password, name } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          error: 'Token and password are required',
        });
      }

      // Validate the invitation token
      const invitation = await InvitationService.validateToken(token);

      if (invitation.role !== 'child') {
        return res.status(400).json({
          success: false,
          error: 'This invitation is not for a child account',
        });
      }

      if (!invitation.childProfileId) {
        return res.status(400).json({
          success: false,
          error: 'No child profile associated with this invitation',
        });
      }

      // Register the child user
      const result = await AuthService.register(
        invitation.email,
        password,
        'child',
        name || invitation.childProfile?.name
      );

      // Mark invitation as accepted
      await InvitationService.acceptInvitation(token, result.user.id);

      // TODO: Link the user to the child profile
      // This will be done in a future update to the ChildProfile model

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
