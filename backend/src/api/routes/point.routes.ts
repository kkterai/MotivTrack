import { Router } from 'express';
import { PointController } from '../controllers/point.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/points/child/:childProfileId/balance
 * @desc    Get point balance for a child
 * @access  Private
 */
router.get('/child/:childProfileId/balance', authenticate, PointController.getBalance);

/**
 * @route   GET /api/points/child/:childProfileId/history
 * @desc    Get point transaction history
 * @access  Private
 */
router.get('/child/:childProfileId/history', authenticate, PointController.getHistory);

/**
 * @route   GET /api/points/child/:childProfileId/metrics
 * @desc    Get point metrics
 * @access  Private
 */
router.get('/child/:childProfileId/metrics', authenticate, PointController.getMetrics);

export default router;
