import { Router } from 'express';
import { TaskAssignmentController } from '../controllers/taskAssignment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * Task Assignment Routes
 * All routes require authentication
 */

// Assign a task to a specific date
router.post(
  '/',
  authenticate,
  requireRole('admin_parent'),
  TaskAssignmentController.assignTask
);

// Bulk assign multiple tasks
router.post(
  '/bulk',
  authenticate,
  requireRole('admin_parent'),
  TaskAssignmentController.assignMultipleTasks
);

// Unassign a task
router.delete(
  '/:assignmentId',
  authenticate,
  requireRole('admin_parent'),
  TaskAssignmentController.unassignTask
);

// Get assignments for a specific date
router.get(
  '/child/:childProfileId/date/:date',
  authenticate,
  TaskAssignmentController.getAssignmentsForDate
);

// Get assignments for a date range
router.get(
  '/child/:childProfileId/range',
  authenticate,
  TaskAssignmentController.getAssignmentsForDateRange
);

// Get all assignments for a child
router.get(
  '/child/:childProfileId',
  authenticate,
  TaskAssignmentController.getChildAssignments
);

// Get assignment statistics
router.get(
  '/child/:childProfileId/stats',
  authenticate,
  TaskAssignmentController.getAssignmentStats
);

// Get unassigned tasks
router.get(
  '/child/:childProfileId/unassigned',
  authenticate,
  TaskAssignmentController.getUnassignedTasks
);

// Mark assignment as completed
router.patch(
  '/:assignmentId/complete',
  authenticate,
  TaskAssignmentController.markAssignmentCompleted
);

export default router;
