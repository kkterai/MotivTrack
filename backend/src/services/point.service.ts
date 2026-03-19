import prisma from '../config/database.js';

interface AwardPointsDTO {
  childProfileId: string;
  amount: number;
  source: 'task_claim' | 'school_behavior' | 'streak_bonus' | 'daily_bonus' | 'weekly_bonus' | 'welcome_bonus';
  referenceTaskClaimId?: string;
  referenceBehaviorRatingId?: string;
}

export class PointService {
  /**
   * Award points to a child (creates immutable PointTransaction)
   */
  static async awardPoints(data: AwardPointsDTO) {
    // Verify child profile exists
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: data.childProfileId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    // Create immutable point transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        childProfileId: data.childProfileId,
        amount: data.amount,
        source: data.source,
        referenceTaskClaimId: data.referenceTaskClaimId,
        referenceBehaviorRatingId: data.referenceBehaviorRatingId,
      },
    });

    return transaction;
  }

  /**
   * Calculate total points for a child
   */
  static async getTotalPoints(childProfileId: string): Promise<number> {
    const result = await prisma.pointTransaction.aggregate({
      where: {
        childProfileId,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }

  /**
   * Get point transaction history
   */
  static async getPointHistory(childProfileId: string, limit = 50) {
    const transactions = await prisma.pointTransaction.findMany({
      where: {
        childProfileId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return transactions;
  }

  /**
   * Get points by source (breakdown)
   */
  static async getPointsBySource(childProfileId: string) {
    const transactions = await prisma.pointTransaction.groupBy({
      by: ['source'],
      where: {
        childProfileId,
      },
      _sum: {
        amount: true,
      },
    });

    const pointsBySource: Record<string, number> = {};
    
    transactions.forEach((t) => {
      pointsBySource[t.source] = t._sum.amount || 0;
    });

    return pointsBySource;
  }

  /**
   * Get point metrics for a child
   */
  static async getPointMetrics(childProfileId: string) {
    const [totalPoints, pointsBySource, recentTransactions] = await Promise.all([
      this.getTotalPoints(childProfileId),
      this.getPointsBySource(childProfileId),
      this.getPointHistory(childProfileId, 10),
    ]);

    // Calculate points this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weekResult = await prisma.pointTransaction.aggregate({
      where: {
        childProfileId,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const pointsThisWeek = weekResult._sum.amount || 0;

    // Calculate points this month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const monthResult = await prisma.pointTransaction.aggregate({
      where: {
        childProfileId,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const pointsThisMonth = monthResult._sum.amount || 0;

    return {
      totalPoints,
      pointsThisWeek,
      pointsThisMonth,
      pointsBySource,
      recentTransactions,
    };
  }

  /**
   * Award welcome bonus points
   */
  static async awardWelcomeBonus(childProfileId: string, amount: number) {
    return this.awardPoints({
      childProfileId,
      amount,
      source: 'welcome_bonus',
    });
  }

  /**
   * Award streak bonus points
   */
  static async awardStreakBonus(childProfileId: string, amount: number) {
    return this.awardPoints({
      childProfileId,
      amount,
      source: 'streak_bonus',
    });
  }

  /**
   * Deduct points (for reward redemption)
   * Note: This creates a negative point transaction
   */
  static async deductPoints(childProfileId: string, amount: number, reason: string) {
    // Verify child has enough points
    const totalPoints = await this.getTotalPoints(childProfileId);

    if (totalPoints < amount) {
      throw new Error('Insufficient points');
    }

    // Create negative transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        childProfileId,
        amount: -amount, // Negative amount
        source: 'task_claim', // Using task_claim as default, could add 'reward_redemption' to enum
      },
    });

    return transaction;
  }
}
