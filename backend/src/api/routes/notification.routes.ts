import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for current user
 * @access  Private
 */
router.get('/', authenticate, NotificationController.getNotifications);

/**
 * @route   PUT /api/notifications/:id/open
 * @desc    Mark notification as opened
 * @access  Private
 */
router.put('/:id/open', authenticate, NotificationController.markAsOpened);

/**
 * @route   GET /api/notifications/metrics/ner
 * @desc    Calculate NER metric for current user
 * @access  Private
 */
router.get('/metrics/ner', authenticate, NotificationController.calculateNER);

export default router;
