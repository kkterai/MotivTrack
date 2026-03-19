import prisma from '../config/database.js';
import { NotificationPayload } from '../types/index.js';

interface SendNotificationDTO {
  userId: string;
  type: 'task_claim_pending' | 'verification_reminder' | 'points_awarded' | 'reward_redeemed' | 'reward_delivery_reminder' | 'teacher_reminder' | 'streak_milestone' | 'annual_survey';
  payload: NotificationPayload;
}

export class NotificationService {
  /**
   * Send a notification to a user
   */
  static async sendNotification(data: SendNotificationDTO) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create notification log entry
    const notification = await prisma.notificationLog.create({
      data: {
        userId: data.userId,
        type: data.type,
        payload: JSON.stringify(data.payload),
        status: 'sent',
      },
    });

    // In MVP, this is in-app only
    // In V2, this would trigger push notifications, email, or SMS

    return notification;
  }

  /**
   * Mark notification as opened
   */
  static async markAsOpened(notificationId: string, userId: string) {
    const notification = await prisma.notificationLog.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const updatedNotification = await prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: 'opened',
        openedAt: new Date(),
      },
    });

    return updatedNotification;
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string, limit = 50) {
    const notifications = await prisma.notificationLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: limit,
    });

    // Parse payload JSON
    return notifications.map((n) => ({
      ...n,
      payload: JSON.parse(n.payload),
    }));
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const count = await prisma.notificationLog.count({
      where: {
        userId,
        status: 'sent', // Not opened
      },
    });

    return count;
  }

  /**
   * Calculate Notification Engagement Rate (NER) - Critical PRD metric
   */
  static async calculateNER(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalSent, totalOpened] = await Promise.all([
      prisma.notificationLog.count({
        where: {
          userId,
          sentAt: {
            gte: startDate,
          },
        },
      }),
      prisma.notificationLog.count({
        where: {
          userId,
          sentAt: {
            gte: startDate,
          },
          status: 'opened',
        },
      }),
    ]);

    const engagementRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

    return {
      totalSent,
      totalOpened,
      engagementRate,
      period: `${days} days`,
    };
  }

  /**
   * Calculate NER by role (for metrics dashboard)
   */
  static async calculateNERByRole(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        role: true,
      },
    });

    const nerByRole: Record<string, { sent: number; opened: number; rate: number }> = {
      admin_parent: { sent: 0, opened: 0, rate: 0 },
      delivery_parent: { sent: 0, opened: 0, rate: 0 },
      child: { sent: 0, opened: 0, rate: 0 },
      teacher: { sent: 0, opened: 0, rate: 0 },
    };

    for (const user of users) {
      const [sent, opened] = await Promise.all([
        prisma.notificationLog.count({
          where: {
            userId: user.id,
            sentAt: { gte: startDate },
          },
        }),
        prisma.notificationLog.count({
          where: {
            userId: user.id,
            sentAt: { gte: startDate },
            status: 'opened',
          },
        }),
      ]);

      nerByRole[user.role].sent += sent;
      nerByRole[user.role].opened += opened;
    }

    // Calculate rates
    Object.keys(nerByRole).forEach((role) => {
      const data = nerByRole[role];
      data.rate = data.sent > 0 ? (data.opened / data.sent) * 100 : 0;
    });

    return nerByRole;
  }

  /**
   * Send verification reminder (24h/48h cycles)
   */
  static async sendVerificationReminder(parentId: string, claimId: string, taskTitle: string, childName: string) {
    return this.sendNotification({
      userId: parentId,
      type: 'verification_reminder',
      payload: {
        title: 'Reminder: Task waiting for verification',
        body: `${childName} is waiting for you to verify: ${taskTitle}`,
        actionUrl: `/parent/verify/${claimId}`,
        metadata: {
          claimId,
          taskTitle,
          childName,
        },
      },
    });
  }

  /**
   * Send reward delivery reminder
   */
  static async sendRewardDeliveryReminder(parentId: string, rewardTitle: string, childName: string, redemptionId: string) {
    return this.sendNotification({
      userId: parentId,
      type: 'reward_delivery_reminder',
      payload: {
        title: 'Reward ready to deliver',
        body: `${childName} earned: ${rewardTitle}. Mark as delivered when complete.`,
        actionUrl: `/parent/rewards/${redemptionId}`,
        metadata: {
          redemptionId,
          rewardTitle,
          childName,
        },
      },
    });
  }

  /**
   * Send streak milestone notification
   */
  static async sendStreakMilestone(childId: string, streakDays: number) {
    return this.sendNotification({
      userId: childId,
      type: 'streak_milestone',
      payload: {
        title: `🔥 ${streakDays}-day streak!`,
        body: `Amazing! You've completed all tasks for ${streakDays} days in a row!`,
        actionUrl: '/child/dashboard',
        metadata: {
          streakDays,
        },
      },
    });
  }
}
