import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// Public route - validate token (no auth required)
router.get('/validate/:token', InvitationController.validateToken);

// Protected routes - require authentication
router.use(authenticate);

// Create invitation (admin_parent only)
router.post(
  '/',
  requireRole('admin_parent'),
  InvitationController.createInvitation
);

// Get my invitations
router.get('/', InvitationController.getMyInvitations);

// Accept invitation (authenticated user)
router.post('/:token/accept', InvitationController.acceptInvitation);

// Resend invitation (admin_parent only)
router.post(
  '/:id/resend',
  requireRole('admin_parent'),
  InvitationController.resendInvitation
);

// Cancel invitation (admin_parent only)
router.delete(
  '/:id',
  requireRole('admin_parent'),
  InvitationController.cancelInvitation
);

export default router;
