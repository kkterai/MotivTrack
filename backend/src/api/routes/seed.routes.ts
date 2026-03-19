import { Router } from 'express';
import { SeedController } from '../controllers/seed.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// All seed routes require authentication and admin_parent role
router.use(authenticate);
router.use(requireRole(['admin_parent']));

/**
 * POST /api/seed/child/:childProfileId
 * Seed default tasks and rewards for a child profile
 */
router.post('/child/:childProfileId', SeedController.seedChildProfile);

/**
 * POST /api/seed/child/:childProfileId/tasks
 * Seed default tasks only for a child profile
 */
router.post('/child/:childProfileId/tasks', SeedController.seedTasks);

/**
 * POST /api/seed/child/:childProfileId/rewards
 * Seed default rewards only for a child profile
 */
router.post('/child/:childProfileId/rewards', SeedController.seedRewards);

export default router;
