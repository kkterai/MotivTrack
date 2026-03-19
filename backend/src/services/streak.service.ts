import prisma from '../config/database.js';
import { PointService } from './point.service.js';
import { NotificationService } from './notification.service.js';

export class StreakService {
  /**
   * Calculate and update streak for a child
   * Called after a task is verified
   */
  static async updateStreak(childProfileId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Get or create streak record
    let streakRecord = await prisma.streakRecord.findUnique({
      where: { childProfileId },
    });

    if (!streakRecord) {
      streakRecord = await prisma.streakRecord.create({
        data: {
          childProfileId,
          currentDailyStreak: 0,
          currentWeeklyStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Check if all tasks for today are verified
    const allTasksComplete = await this.areAllTasksCompleteForDate(childProfileId, today);

    if (!allTasksComplete) {
      // Not all tasks complete yet, don't update streak
      return streakRecord;
    }

    // Check if we already counted today
    const lastCompleted = streakRecord.lastCompletedDate
      ? new Date(streakRecord.lastCompletedDate)
      : null;

    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
      if (lastCompleted.getTime() === today.getTime()) {
        // Already counted today
        return streakRecord;
      }
    }

    // Calculate new streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newDailyStreak = 1;

    if (lastCompleted) {
      lastCompleted.setHours(0, 0, 0, 0);
      if (lastCompleted.getTime() === yesterday.getTime()) {
        // Consecutive day
        newDailyStreak = streakRecord.currentDailyStreak + 1;
      }
      // If gap > 1 day, streak resets to 1
    }

    // Update longest streak
    const newLongestStreak = Math.max(streakRecord.longestStreak, newDailyStreak);

    // Calculate weekly streak (7 consecutive days = 1 week)
    const newWeeklyStreak = Math.floor(newDailyStreak / 7);

    // Update streak record
    const updatedStreak = await prisma.streakRecord.update({
      where: { childProfileId },
      data: {
        currentDailyStreak: newDailyStreak,
        currentWeeklyStreak: newWeeklyStreak,
        longestStreak: newLongestStreak,
        lastCompletedDate: today,
      },
    });

    // Award streak bonus points
    await this.awardStreakBonus(childProfileId, newDailyStreak, newWeeklyStreak);

    // Send streak milestone notifications
    await this.sendStreakMilestones(childProfileId, newDailyStreak);

    return updatedStreak;
  }

  /**
   * Check if all tasks for a date are verified
   */
  static async areAllTasksCompleteForDate(childProfileId: string, date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all active tasks for this child
    const totalTasks = await prisma.task.count({
      where: {
        childProfileId,
        isArchived: false,
      },
    });

    if (totalTasks === 0) {
      return false; // No tasks assigned
    }

    // Get verified claims for today
    const verifiedClaims = await prisma.taskClaim.count({
      where: {
        childProfileId,
        status: 'verified',
        verifiedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return verifiedClaims >= totalTasks;
  }

  /**
   * Award streak bonus points
   */
  static async awardStreakBonus(childProfileId: string, dailyStreak: number, weeklyStreak: number) {
    // Award daily streak bonuses at milestones
    const dailyMilestones = [3, 7, 14, 30, 60, 90]; // Days
    const dailyBonuses = [2, 5, 10, 20, 30, 50]; // Points

    for (let i = 0; i < dailyMilestones.length; i++) {
      if (dailyStreak === dailyMilestones[i]) {
        await PointService.awardStreakBonus(childProfileId, dailyBonuses[i]);
        break;
      }
    }

    // Award weekly streak bonus (every week)
    if (weeklyStreak > 0 && dailyStreak % 7 === 0) {
      const weeklyBonus = 10 + (weeklyStreak * 2); // Escalating bonus
      await PointService.awardStreakBonus(childProfileId, weeklyBonus);
    }
  }

  /**
   * Send streak milestone notifications
   */
  static async sendStreakMilestones(childProfileId: string, dailyStreak: number) {
    // Get child user ID
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: {
        adminParent: true,
      },
    });

    if (!childProfile) {
      return;
    }

    // Find child user (assuming child has a user account linked)
    const childUser = await prisma.user.findFirst({
      where: {
        role: 'child',
        // In a real implementation, we'd have a userId field on ChildProfile
        // For now, we'll skip the notification if we can't find the user
      },
    });

    if (!childUser) {
      return;
    }

    // Send notifications at milestones
    const milestones = [3, 7, 14, 30, 60, 90];

    if (milestones.includes(dailyStreak)) {
      await NotificationService.sendStreakMilestone(childUser.id, dailyStreak);
    }
  }

  /**
   * Get streak record for a child
   */
  static async getStreak(childProfileId: string) {
    let streakRecord = await prisma.streakRecord.findUnique({
      where: { childProfileId },
    });

    if (!streakRecord) {
      // Create initial record
      streakRecord = await prisma.streakRecord.create({
        data: {
          childProfileId,
          currentDailyStreak: 0,
          currentWeeklyStreak: 0,
          longestStreak: 0,
        },
      });
    }

    return streakRecord;
  }

  /**
   * Get streak metrics for dashboard
   */
  static async getStreakMetrics(childProfileId: string) {
    const streak = await this.getStreak(childProfileId);

    // Calculate next milestone
    const milestones = [3, 7, 14, 30, 60, 90];
    const nextMilestone = milestones.find((m) => m > streak.currentDailyStreak) || null;

    // Calculate days until next milestone
    const daysUntilMilestone = nextMilestone
      ? nextMilestone - streak.currentDailyStreak
      : null;

    return {
      currentDailyStreak: streak.currentDailyStreak,
      currentWeeklyStreak: streak.currentWeeklyStreak,
      longestStreak: streak.longestStreak,
      lastCompletedDate: streak.lastCompletedDate,
      nextMilestone,
      daysUntilMilestone,
    };
  }

  /**
   * Calculate Streak Survival Rate (SSR) - Critical PRD metric
   * Target: ≥40% of families achieve at least one 7-day streak within 30 days
   */
  static async calculateSSR(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all child profiles created in the period
    const totalChildren = await prisma.childProfile.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        isArchived: false,
      },
    });

    if (totalChildren === 0) {
      return {
        totalChildren: 0,
        childrenWith7DayStreak: 0,
        survivalRate: 0,
        period: `${days} days`,
        meetsTarget: false,
      };
    }

    // Get children who achieved at least a 7-day streak
    const childrenWith7DayStreak = await prisma.streakRecord.count({
      where: {
        childProfile: {
          createdAt: {
            gte: startDate,
          },
          isArchived: false,
        },
        longestStreak: {
          gte: 7,
        },
      },
    });

    const survivalRate = (childrenWith7DayStreak / totalChildren) * 100;

    return {
      totalChildren,
      childrenWith7DayStreak,
      survivalRate,
      period: `${days} days`,
      meetsTarget: survivalRate >= 40, // PRD target
    };
  }
}
