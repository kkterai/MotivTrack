import { Router } from 'express';
import { RewardController } from '../controllers/reward.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdminParent, requireChild, requireParent } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   POST /api/rewards
 * @desc    Create a new reward
 * @access  Private (Admin Parent only)
 */
router.post('/', authenticate, requireAdminParent, RewardController.createReward);

/**
 * @route   GET /api/rewards/child/:childProfileId
 * @desc    Get rewards for a child
 * @access  Private
 */
router.get('/child/:childProfileId', authenticate, RewardController.getRewardsByChild);

/**
 * @route   PUT /api/rewards/:id
 * @desc    Update a reward
 * @access  Private (Admin Parent only)
 */
router.put('/:id', authenticate, requireAdminParent, RewardController.updateReward);

/**
 * @route   POST /api/rewards/:id/redeem
 * @desc    Redeem a reward
 * @access  Private (Child only)
 */
router.post('/:id/redeem', authenticate, requireChild, RewardController.redeemReward);

/**
 * @route   GET /api/rewards/redemptions/pending
 * @desc    Get pending redemptions for parent
 * @access  Private (Parent only)
 */
router.get('/redemptions/pending', authenticate, requireParent, RewardController.getPendingRedemptions);

/**
 * @route   PUT /api/rewards/redemptions/:id/deliver
 * @desc    Mark reward as delivered
 * @access  Private (Parent only)
 */
router.put('/redemptions/:id/deliver', authenticate, requireParent, RewardController.markAsDelivered);

/**
 * @route   GET /api/rewards/metrics/rdt
 * @desc    Calculate RDT metric
 * @access  Private (Parent only)
 */
router.get('/metrics/rdt', authenticate, requireParent, RewardController.calculateRDT);

export default router;
