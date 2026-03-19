import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireChild, requireParent } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   POST /api/claims
 * @desc    Create a new claim (child marks task complete)
 * @access  Private (Child only)
 */
router.post('/', authenticate, requireChild, ClaimController.createClaim);

/**
 * @route   PUT /api/claims/:id/verify
 * @desc    Verify a claim (parent approves/requests redo)
 * @access  Private (Parent only)
 */
router.put('/:id/verify', authenticate, requireParent, ClaimController.verifyClaim);

/**
 * @route   GET /api/claims/pending
 * @desc    Get pending claims for parent review
 * @access  Private (Parent only)
 */
router.get('/pending', authenticate, requireParent, ClaimController.getPendingClaims);

/**
 * @route   GET /api/claims/child/:childProfileId
 * @desc    Get claims for a child
 * @access  Private
 */
router.get('/child/:childProfileId', authenticate, ClaimController.getClaimsByChild);

export default router;
