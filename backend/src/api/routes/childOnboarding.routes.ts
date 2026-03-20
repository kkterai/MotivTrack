import { Router } from 'express';
import { ChildOnboardingController } from '../controllers/childOnboarding.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireChild } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @route   POST /api/child-onboarding/complete
 * @desc    Complete child onboarding (save preferences and award points)
 * @access  Private (Child only)
 */
router.post(
  '/complete',
  authenticate,
  requireChild,
  ChildOnboardingController.completeOnboarding
);

/**
 * @route   GET /api/child-onboarding/status
 * @desc    Get child onboarding status
 * @access  Private (Child only)
 */
router.get(
  '/status',
  authenticate,
  requireChild,
  ChildOnboardingController.getOnboardingStatus
);

export default router;
