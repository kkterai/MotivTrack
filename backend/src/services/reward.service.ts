import prisma from '../config/database.js';
import { CreateRewardDTO, UpdateRewardDTO } from '../types/index.js';
import { PointService } from './point.service.js';
import { NotificationService } from './notification.service.js';

export class RewardService {
  /**
   * Create a new reward
   */
  static async createReward(data: CreateRewardDTO, createdBy: string) {
    // Verify child profile exists and user has permission
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: data.childProfileId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    // Only admin parent can create rewards
    if (childProfile.adminParentId !== createdBy) {
      throw new Error('Only admin parent can create rewards');
    }

    const reward = await prisma.reward.create({
      data: {
        childProfileId: data.childProfileId,
        title: data.title,
        description: data.description,
        pointCost: data.pointCost,
        createdBy,
      },
      include: {
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reward;
  }

  /**
   * Get all rewards for a child
   */
  static async getRewardsByChild(childProfileId: string, includeRetired = false) {
    const rewards = await prisma.reward.findMany({
      where: {
        childProfileId,
        isRetired: includeRetired ? undefined : false,
        isActive: true,
      },
      orderBy: {
        pointCost: 'asc', // Cheapest first
      },
    });

    return rewards;
  }

  /**
   * Get a single reward by ID
   */
  static async getRewardById(rewardId: string) {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: {
        childProfile: {
          select: {
            id: true,
            name: true,
            adminParentId: true,
            deliveryParentId: true,
          },
        },
        rewardRedemptions: {
          orderBy: {
            redeemedAt: 'desc',
          },
          take: 5, // Last 5 redemptions
        },
      },
    });

    if (!reward) {
      throw new Error('Reward not found');
    }

    return reward;
  }

  /**
   * Update a reward
   */
  static async updateReward(rewardId: string, data: UpdateRewardDTO, userId: string) {
    const reward = await this.getRewardById(rewardId);

    // Only admin parent can update rewards
    if (reward.childProfile.adminParentId !== userId) {
      throw new Error('Only admin parent can update rewards');
    }

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        title: data.title,
        description: data.description,
        pointCost: data.pointCost,
        isActive: data.isActive,
        isRetired: data.isRetired,
      },
      include: {
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedReward;
  }

  /**
   * Retire a reward (soft delete)
   */
  static async retireReward(rewardId: string, userId: string) {
    const reward = await this.getRewardById(rewardId);

    // Only admin parent can retire rewards
    if (reward.childProfile.adminParentId !== userId) {
      throw new Error('Only admin parent can retire rewards');
    }

    const retiredReward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        isRetired: true,
        isActive: false,
      },
    });

    return retiredReward;
  }

  /**
   * Redeem a reward (child earns it)
   */
  static async redeemReward(rewardId: string, childId: string) {
    const reward = await this.getRewardById(rewardId);

    // Verify child has enough points
    const totalPoints = await PointService.getTotalPoints(reward.childProfileId);

    if (totalPoints < reward.pointCost) {
      throw new Error(`Insufficient points. Need ${reward.pointCost}, have ${totalPoints}`);
    }

    // Deduct points
    await PointService.deductPoints(reward.childProfileId, reward.pointCost, `Redeemed: ${reward.title}`);

    // Create redemption record
    const redemption = await prisma.rewardRedemption.create({
      data: {
        rewardId: reward.id,
        childProfileId: reward.childProfileId,
      },
      include: {
        reward: true,
        childProfile: {
          select: {
            id: true,
            name: true,
            adminParentId: true,
            deliveryParentId: true,
          },
        },
      },
    });

    // Send notification to admin parent
    await NotificationService.sendNotification({
      userId: reward.childProfile.adminParentId,
      type: 'reward_redeemed',
      payload: {
        title: `${reward.childProfile.name} earned a reward!`,
        body: `${reward.title} - ${reward.pointCost} points. Mark as delivered when complete.`,
        actionUrl: `/parent/rewards/${redemption.id}`,
        metadata: {
          redemptionId: redemption.id,
          rewardId: reward.id,
          rewardTitle: reward.title,
          childName: reward.childProfile.name,
          pointCost: reward.pointCost,
        },
      },
    });

    // Also notify delivery parent if exists
    if (reward.childProfile.deliveryParentId) {
      await NotificationService.sendNotification({
        userId: reward.childProfile.deliveryParentId,
        type: 'reward_redeemed',
        payload: {
          title: `${reward.childProfile.name} earned a reward!`,
          body: `${reward.title} - ${reward.pointCost} points. Mark as delivered when complete.`,
          actionUrl: `/parent/rewards/${redemption.id}`,
          metadata: {
            redemptionId: redemption.id,
            rewardId: reward.id,
            rewardTitle: reward.title,
            childName: reward.childProfile.name,
            pointCost: reward.pointCost,
          },
        },
      });
    }

    return redemption;
  }

  /**
   * Mark reward as delivered (Admin or Delivery Parent)
   */
  static async markAsDelivered(redemptionId: string, deliveredBy: string) {
    const redemption = await prisma.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: {
        reward: true,
        childProfile: {
          select: {
            id: true,
            name: true,
            adminParentId: true,
            deliveryParentId: true,
          },
        },
      },
    });

    if (!redemption) {
      throw new Error('Redemption not found');
    }

    // Only admin or delivery parent can mark as delivered
    const isAdminParent = redemption.childProfile.adminParentId === deliveredBy;
    const isDeliveryParent = redemption.childProfile.deliveryParentId === deliveredBy;

    if (!isAdminParent && !isDeliveryParent) {
      throw new Error('Only admin or delivery parent can mark rewards as delivered');
    }

    const updatedRedemption = await prisma.rewardRedemption.update({
      where: { id: redemptionId },
      data: {
        deliveredAt: new Date(),
        deliveredBy,
      },
      include: {
        reward: true,
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedRedemption;
  }

  /**
   * Get redemption history for a child
   */
  static async getRedemptionHistory(childProfileId: string, limit = 50) {
    const redemptions = await prisma.rewardRedemption.findMany({
      where: {
        childProfileId,
      },
      include: {
        reward: {
          select: {
            id: true,
            title: true,
            description: true,
            pointCost: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'desc',
      },
      take: limit,
    });

    return redemptions;
  }

  /**
   * Get pending deliveries (for parent dashboard)
   */
  static async getPendingDeliveries(parentId: string) {
    // Get all child profiles for this parent
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        OR: [
          { adminParentId: parentId },
          { deliveryParentId: parentId },
        ],
      },
      select: {
        id: true,
      },
    });

    const childProfileIds = childProfiles.map((cp) => cp.id);

    // Get undelivered redemptions
    const pendingDeliveries = await prisma.rewardRedemption.findMany({
      where: {
        childProfileId: {
          in: childProfileIds,
        },
        deliveredAt: null,
      },
      include: {
        reward: true,
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'asc', // Oldest first
      },
    });

    return pendingDeliveries;
  }

  /**
   * Calculate Reward Delivery Time (RDT) - Critical PRD metric
   * Target: ≤7 days for standard rewards
   */
  static async calculateRDT(childProfileId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const redemptions = await prisma.rewardRedemption.findMany({
      where: {
        childProfileId,
        redeemedAt: {
          gte: startDate,
        },
        deliveredAt: {
          not: null,
        },
      },
      select: {
        redeemedAt: true,
        deliveredAt: true,
      },
    });

    if (redemptions.length === 0) {
      return {
        averageDays: 0,
        totalRedemptions: 0,
        period: `${days} days`,
      };
    }

    const totalDays = redemptions.reduce((sum, r) => {
      const redeemed = new Date(r.redeemedAt);
      const delivered = new Date(r.deliveredAt!);
      const diffDays = Math.floor((delivered.getTime() - redeemed.getTime()) / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    const averageDays = totalDays / redemptions.length;

    return {
      averageDays,
      totalRedemptions: redemptions.length,
      period: `${days} days`,
      meetsTarget: averageDays <= 7, // PRD target
    };
  }
}
