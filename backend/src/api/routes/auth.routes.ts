import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/register-child
 * @desc    Register child account via invitation token
 * @access  Public
 */
router.post('/register-child', AuthController.registerChild);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Update password
 * @access  Private
 */
router.put('/password', authenticate, AuthController.updatePassword);

/**
 * @route   PATCH /api/auth/update-parent-reference
 * @desc    Update parent reference
 * @access  Private
 */
router.patch('/update-parent-reference', authenticate, AuthController.updateParentReference);

export default router;
