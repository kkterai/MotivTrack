import prisma from '../config/database.js';

/**
 * TaskAssignment Service
 * Handles task assignment operations for the task ownership feature
 */
export class TaskAssignmentService {
  /**
   * Assign a task to a specific date
   */
  static async assignTask(
    taskId: string,
    childProfileId: string,
    assignedFor: Date,
    assignedBy: string
  ) {
    // Verify task exists and belongs to the child
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        childProfile: {
          select: {
            id: true,
            adminParentId: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.childProfileId !== childProfileId) {
      throw new Error('Task does not belong to this child');
    }

    // Verify user has permission (admin parent only)
    if (task.childProfile.adminParentId !== assignedBy) {
      throw new Error('Only admin parent can assign tasks');
    }

    // Normalize date to midnight UTC to ensure consistent date comparison
    const normalizedDate = new Date(assignedFor);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check if assignment already exists
    const existingAssignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_assignedFor: {
          taskId,
          assignedFor: normalizedDate,
        },
      },
    });

    if (existingAssignment) {
      throw new Error('Task is already assigned for this date');
    }

    // Create the assignment
    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        childProfileId,
        assignedFor: normalizedDate,
        assignedBy,
      },
      include: {
        task: {
          include: {
            libraryTask: true,
          },
        },
      },
    });

    return assignment;
  }

  /**
   * Assign multiple tasks at once (bulk operation)
   */
  static async assignMultipleTasks(
    assignments: Array<{
      taskId: string;
      childProfileId: string;
      assignedFor: Date;
    }>,
    assignedBy: string
  ) {
    const results = [];
    const errors = [];

    for (const assignment of assignments) {
      try {
        const result = await this.assignTask(
          assignment.taskId,
          assignment.childProfileId,
          assignment.assignedFor,
          assignedBy
        );
        results.push(result);
      } catch (error) {
        errors.push({
          taskId: assignment.taskId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { results, errors };
  }

  /**
   * Unassign a task from a specific date
   */
  static async unassignTask(assignmentId: string, userId: string) {
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        task: {
          include: {
            childProfile: {
              select: {
                adminParentId: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Verify user has permission
    if (assignment.task.childProfile.adminParentId !== userId) {
      throw new Error('Only admin parent can unassign tasks');
    }

    await prisma.taskAssignment.delete({
      where: { id: assignmentId },
    });

    return { success: true };
  }

  /**
   * Get assignments for a specific date
   */
  static async getAssignmentsForDate(childProfileId: string, date: Date) {
    // Normalize date to midnight UTC
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        childProfileId,
        assignedFor: normalizedDate,
      },
      include: {
        task: {
          include: {
            libraryTask: true,
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
        },
      },
      orderBy: {
        assignedAt: 'asc',
      },
    });

    return assignments;
  }

  /**
   * Get assignments for a date range
   */
  static async getAssignmentsForDateRange(
    childProfileId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Normalize dates to midnight UTC
    const normalizedStart = new Date(startDate);
    normalizedStart.setUTCHours(0, 0, 0, 0);

    const normalizedEnd = new Date(endDate);
    normalizedEnd.setUTCHours(23, 59, 59, 999);

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        childProfileId,
        assignedFor: {
          gte: normalizedStart,
          lte: normalizedEnd,
        },
      },
      include: {
        task: {
          include: {
            libraryTask: true,
          },
        },
      },
      orderBy: [
        {
          assignedFor: 'asc',
        },
        {
          assignedAt: 'asc',
        },
      ],
    });

    return assignments;
  }

  /**
   * Get all assignments for a child (for parent view)
   */
  static async getChildAssignments(childProfileId: string, userId: string) {
    // Verify user has permission
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      select: {
        adminParentId: true,
        deliveryParentId: true,
      },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    if (
      childProfile.adminParentId !== userId &&
      childProfile.deliveryParentId !== userId
    ) {
      throw new Error('Permission denied');
    }

    // Get today and tomorrow
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const assignments = await prisma.taskAssignment.findMany({
      where: {
        childProfileId,
        assignedFor: {
          gte: today,
        },
      },
      include: {
        task: {
          include: {
            libraryTask: true,
            taskClaims: {
              orderBy: {
                claimedAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
      orderBy: [
        {
          assignedFor: 'asc',
        },
        {
          assignedAt: 'asc',
        },
      ],
    });

    return assignments;
  }

  /**
   * Check if a task is assigned for a specific date
   */
  static async isTaskAssigned(taskId: string, date: Date): Promise<boolean> {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const assignment = await prisma.taskAssignment.findUnique({
      where: {
        taskId_assignedFor: {
          taskId,
          assignedFor: normalizedDate,
        },
      },
    });

    return !!assignment;
  }

  /**
   * Get assignment statistics for a child
   */
  static async getAssignmentStats(childProfileId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [todayAssignments, upcomingAssignments, completedToday] =
      await Promise.all([
        // Today's assignments
        prisma.taskAssignment.count({
          where: {
            childProfileId,
            assignedFor: today,
          },
        }),

        // Upcoming assignments (next 7 days)
        prisma.taskAssignment.count({
          where: {
            childProfileId,
            assignedFor: {
              gt: today,
              lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Completed today (assignments with claims)
        prisma.taskAssignment.count({
          where: {
            childProfileId,
            assignedFor: today,
            completedAt: {
              not: null,
            },
          },
        }),
      ]);

    return {
      todayAssignments,
      upcomingAssignments,
      completedToday,
      completionRate:
        todayAssignments > 0 ? (completedToday / todayAssignments) * 100 : 0,
    };
  }

  /**
   * Mark an assignment as completed
   */
  static async markAssignmentCompleted(assignmentId: string) {
    const assignment = await prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: {
        completedAt: new Date(),
      },
    });

    return assignment;
  }

  /**
   * Get unassigned tasks for a child (tasks without assignments)
   */
  static async getUnassignedTasks(childProfileId: string) {
    const tasks = await prisma.task.findMany({
      where: {
        childProfileId,
        isArchived: false,
      },
      include: {
        libraryTask: true,
        taskAssignments: {
          where: {
            assignedFor: {
              gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    return tasks;
  }
}
