import prisma from '../config/database.js';
import { CreateTaskDTO, UpdateTaskDTO } from '../types/index.js';

export class TaskService {
  /**
   * Create a new task for a child
   */
  static async createTask(data: CreateTaskDTO, createdBy: string) {
    console.log('[TaskService.createTask] Input data:', data);
    console.log('[TaskService.createTask] createdBy (user ID):', createdBy);
    
    // Verify child profile exists and user has permission
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: data.childProfileId },
      include: {
        adminParent: true,
        deliveryParent: true,
      },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    console.log('[TaskService.createTask] childProfile.adminParentId:', childProfile.adminParentId);
    console.log('[TaskService.createTask] createdBy:', createdBy);
    console.log('[TaskService.createTask] Match?', childProfile.adminParentId === createdBy);

    // Only admin parent can create tasks
    if (childProfile.adminParentId !== createdBy) {
      console.error('[TaskService.createTask] Permission denied - adminParentId mismatch');
      throw new Error('Only admin parent can create tasks');
    }

    // If task is from library, get library task details
    let libraryTask = null;
    if (data.libraryTaskId) {
      libraryTask = await prisma.libraryTask.findUnique({
        where: { id: data.libraryTaskId },
      });

      if (!libraryTask) {
        throw new Error('Library task not found');
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        childProfileId: data.childProfileId,
        title: data.title,
        doneStandard: data.doneStandard,
        extraWellDoneStandard: data.extraWellDoneStandard,
        tips: data.tips,
        pointsDone: data.pointsDone,
        pointsExtraWellDone: data.pointsExtraWellDone,
        isFromLibrary: !!data.libraryTaskId,
        libraryTaskId: data.libraryTaskId,
      },
      include: {
        libraryTask: true,
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return task;
  }

  /**
   * Get all tasks for a child
   */
  static async getTasksByChild(childProfileId: string, includeArchived = false) {
    const tasks = await prisma.task.findMany({
      where: {
        childProfileId,
        isArchived: includeArchived ? undefined : false,
      },
      include: {
        libraryTask: true,
        taskAssignments: {
          where: {
            assignedFor: {
              gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
            },
          },
          orderBy: {
            assignedFor: 'asc',
          },
        },
        taskClaims: {
          where: {
            status: {
              in: ['pending', 'verified'],
            },
          },
          orderBy: {
            claimedAt: 'desc',
          },
          take: 1, // Get most recent claim
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  /**
   * Get tasks assigned for a specific date (for child view)
   */
  static async getTasksForDate(childProfileId: string, date: Date) {
    // Normalize date to midnight UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: {
        childProfileId,
        isArchived: false,
        taskAssignments: {
          some: {
            assignedFor: normalizedDate,
          },
        },
      },
      include: {
        libraryTask: true,
        taskAssignments: {
          where: {
            assignedFor: normalizedDate,
          },
        },
        taskClaims: {
          where: {
            claimedAt: {
              gte: normalizedDate,
              lt: new Date(normalizedDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          orderBy: {
            claimedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tasks;
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        libraryTask: true,
        childProfile: {
          select: {
            id: true,
            name: true,
            adminParentId: true,
          },
        },
        taskClaims: {
          orderBy: {
            claimedAt: 'desc',
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: string, data: UpdateTaskDTO, userId: string) {
    const task = await this.getTaskById(taskId);

    // Only admin parent can update tasks
    if (task.childProfile.adminParentId !== userId) {
      throw new Error('Only admin parent can update tasks');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        doneStandard: data.doneStandard,
        extraWellDoneStandard: data.extraWellDoneStandard,
        tips: data.tips,
        pointsDone: data.pointsDone,
        pointsExtraWellDone: data.pointsExtraWellDone,
      },
      include: {
        libraryTask: true,
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedTask;
  }

  /**
   * Archive a task (soft delete)
   */
  static async archiveTask(taskId: string, userId: string) {
    const task = await this.getTaskById(taskId);

    // Only admin parent can archive tasks
    if (task.childProfile.adminParentId !== userId) {
      throw new Error('Only admin parent can archive tasks');
    }

    const archivedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        isArchived: true,
      },
    });

    return archivedTask;
  }

  /**
   * Get task statistics for a child
   */
  static async getTaskStats(childProfileId: string) {
    const [totalTasks, completedTasks, pendingClaims] = await Promise.all([
      // Total active tasks
      prisma.task.count({
        where: {
          childProfileId,
          isArchived: false,
        },
      }),

      // Tasks with verified claims
      prisma.taskClaim.count({
        where: {
          childProfileId,
          status: 'verified',
        },
      }),

      // Pending claims
      prisma.taskClaim.count({
        where: {
          childProfileId,
          status: 'pending',
        },
      }),
    ]);

    return {
      totalTasks,
      completedTasks,
      pendingClaims,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }
}
