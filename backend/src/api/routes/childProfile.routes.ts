import { Router } from 'express';
import { ChildProfileController } from '../controllers/childProfile.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create child profile (admin_parent only)
router.post(
  '/',
  requireRole(['admin_parent']),
  ChildProfileController.createChildProfile
);

// Get all my child profiles (parent roles)
router.get(
  '/',
  requireRole(['admin_parent', 'delivery_parent']),
  ChildProfileController.getMyChildProfiles
);

// Get specific child profile
router.get('/:id', ChildProfileController.getChildProfile);

// Get child dashboard data
router.get('/:id/dashboard', ChildProfileController.getChildDashboard);

// Update child profile (admin_parent only)
router.put(
  '/:id',
  requireRole(['admin_parent']),
  ChildProfileController.updateChildProfile
);

// Add delivery parent (admin_parent only)
router.post(
  '/:id/delivery-parent',
  requireRole(['admin_parent']),
  ChildProfileController.addDeliveryParent
);

// Archive child profile (admin_parent only)
router.delete(
  '/:id',
  requireRole(['admin_parent']),
  ChildProfileController.archiveChildProfile
);

export default router;
