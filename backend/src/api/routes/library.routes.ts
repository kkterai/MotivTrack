import { Router } from 'express';
import { LibraryController } from '../controllers/library.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/library
 * @desc    Browse library tasks
 * @access  Private
 */
router.get('/', authenticate, LibraryController.browseTasks);

/**
 * @route   GET /api/library/:id
 * @desc    Get library task by ID
 * @access  Private
 */
router.get('/:id', authenticate, LibraryController.getTaskById);

/**
 * @route   POST /api/library/seed
 * @desc    Seed library with default tasks (development only)
 * @access  Private
 */
router.post('/seed', authenticate, LibraryController.seedLibrary);

export default router;
