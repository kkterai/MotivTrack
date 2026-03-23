import { TaskAssignmentService } from '../taskAssignment.service';
import prisma from '../../config/database';

/**
 * Unit Tests for TaskAssignment Service
 * 
 * These tests verify the core functionality of task assignment operations.
 * Run with: npm test
 */

// Mock Prisma client
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    task: {
      findUnique: jest.fn(),
    },
    taskAssignment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('TaskAssignmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignTask', () => {
    it('should successfully assign a task to a date', async () => {
      const mockTask = {
        id: 'task-1',
        childProfileId: 'child-1',
        childProfile: {
          id: 'child-1',
          adminParentId: 'parent-1',
        },
      };

      const mockAssignment = {
        id: 'assignment-1',
        taskId: 'task-1',
        childProfileId: 'child-1',
        assignedFor: new Date('2026-03-23'),
        assignedBy: 'parent-1',
        assignedAt: new Date(),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.taskAssignment.create as jest.Mock).mockResolvedValue(mockAssignment);

      const result = await TaskAssignmentService.assignTask(
        'task-1',
        'child-1',
        new Date('2026-03-23'),
        'parent-1'
      );

      expect(result).toEqual(mockAssignment);
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        include: {
          childProfile: {
            select: {
              id: true,
              adminParentId: true,
            },
          },
        },
      });
    });

    it('should throw error if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskAssignmentService.assignTask(
          'invalid-task',
          'child-1',
          new Date('2026-03-23'),
          'parent-1'
        )
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if task already assigned for date', async () => {
      const mockTask = {
        id: 'task-1',
        childProfileId: 'child-1',
        childProfile: {
          id: 'child-1',
          adminParentId: 'parent-1',
        },
      };

      const existingAssignment = {
        id: 'assignment-1',
        taskId: 'task-1',
        assignedFor: new Date('2026-03-23'),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValue(existingAssignment);

      await expect(
        TaskAssignmentService.assignTask(
          'task-1',
          'child-1',
          new Date('2026-03-23'),
          'parent-1'
        )
      ).rejects.toThrow('Task is already assigned for this date');
    });

    it('should throw error if user is not admin parent', async () => {
      const mockTask = {
        id: 'task-1',
        childProfileId: 'child-1',
        childProfile: {
          id: 'child-1',
          adminParentId: 'parent-1',
        },
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      await expect(
        TaskAssignmentService.assignTask(
          'task-1',
          'child-1',
          new Date('2026-03-23'),
          'wrong-parent'
        )
      ).rejects.toThrow('Only admin parent can assign tasks');
    });
  });

  describe('getAssignmentsForDate', () => {
    it('should return assignments for a specific date', async () => {
      const mockAssignments = [
        {
          id: 'assignment-1',
          taskId: 'task-1',
          childProfileId: 'child-1',
          assignedFor: new Date('2026-03-23'),
          task: {
            id: 'task-1',
            title: 'Test Task',
            pointsDone: 10,
          },
        },
      ];

      (prisma.taskAssignment.findMany as jest.Mock).mockResolvedValue(mockAssignments);

      const result = await TaskAssignmentService.getAssignmentsForDate(
        'child-1',
        new Date('2026-03-23')
      );

      expect(result).toEqual(mockAssignments);
      expect(prisma.taskAssignment.findMany).toHaveBeenCalled();
    });
  });

  describe('unassignTask', () => {
    it('should successfully unassign a task', async () => {
      const mockAssignment = {
        id: 'assignment-1',
        task: {
          childProfile: {
            adminParentId: 'parent-1',
          },
        },
      };

      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValue(mockAssignment);
      (prisma.taskAssignment.delete as jest.Mock).mockResolvedValue(mockAssignment);

      const result = await TaskAssignmentService.unassignTask('assignment-1', 'parent-1');

      expect(result).toEqual({ success: true });
      expect(prisma.taskAssignment.delete).toHaveBeenCalledWith({
        where: { id: 'assignment-1' },
      });
    });

    it('should throw error if assignment not found', async () => {
      (prisma.taskAssignment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskAssignmentService.unassignTask('invalid-assignment', 'parent-1')
      ).rejects.toThrow('Assignment not found');
    });
  });

  describe('getAssignmentStats', () => {
    it('should return assignment statistics', async () => {
      (prisma.taskAssignment.count as jest.Mock)
        .mockResolvedValueOnce(5) // today
        .mockResolvedValueOnce(3) // upcoming
        .mockResolvedValueOnce(2); // completed

      const result = await TaskAssignmentService.getAssignmentStats('child-1');

      expect(result).toEqual({
        todayAssignments: 5,
        upcomingAssignments: 3,
        completedToday: 2,
        completionRate: 40,
      });
    });
  });
});
