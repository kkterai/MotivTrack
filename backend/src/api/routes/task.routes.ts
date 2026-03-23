import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdminParent } from '../middlewares/role.middleware';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (Admin Parent only)
 */
router.post('/', authenticate, requireAdminParent, TaskController.createTask);

/**
 * @route   GET /api/tasks/child/:childProfileId
 * @desc    Get all tasks for a child
 * @access  Private
 */
router.get('/child/:childProfileId', authenticate, TaskController.getTasksByChild);

/**
 * @route   GET /api/tasks/child/:childProfileId/date/:date
 * @desc    Get tasks assigned for a specific date
 * @access  Private
 */
router.get('/child/:childProfileId/date/:date', authenticate, TaskController.getTasksForDate);

/**
 * @route   GET /api/tasks/child/:childProfileId/stats
 * @desc    Get task statistics for a child
 * @access  Private
 */
router.get('/child/:childProfileId/stats', authenticate, TaskController.getTaskStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', authenticate, TaskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private (Admin Parent only)
 */
router.put('/:id', authenticate, requireAdminParent, TaskController.updateTask);

export default router;
