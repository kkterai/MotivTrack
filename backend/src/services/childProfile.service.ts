import prisma from '../config/database.js';
import { PointService } from './point.service.js';
import { SeedService } from './seed.service.js';

interface CreateChildProfileDTO {
  name: string;
  grade?: string;
  age?: number;
  schoolName?: string;
  schoolDomain?: string;
  adminParentId: string;
  welcomeBonusPoints?: number;
}

interface UpdateChildProfileDTO {
  name?: string;
  grade?: string;
  schoolName?: string;
  schoolDomain?: string;
  deliveryParentId?: string;
}

export class ChildProfileService {
  /**
   * Create a new child profile
   */
  static async createChildProfile(data: CreateChildProfileDTO) {
    const {
      name,
      grade,
      age,
      schoolName,
      schoolDomain,
      adminParentId,
      welcomeBonusPoints = 0,
    } = data;

    console.log('[ChildProfileService.createChildProfile] Input data:', data);
    console.log('[ChildProfileService.createChildProfile] adminParentId:', adminParentId);

    // Create child profile
    const childProfile = await prisma.childProfile.create({
      data: {
        name,
        grade,
        schoolName,
        schoolDomain,
        adminParentId,
      },
      include: {
        adminParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('[ChildProfileService.createChildProfile] Created child profile:', childProfile);
    console.log('[ChildProfileService.createChildProfile] Child profile ID:', childProfile.id);
    console.log('[ChildProfileService.createChildProfile] Admin parent ID:', childProfile.adminParentId);

    // Award welcome bonus points if specified
    if (welcomeBonusPoints > 0) {
      console.log('[ChildProfileService.createChildProfile] Awarding welcome bonus:', welcomeBonusPoints);
      await PointService.awardWelcomeBonus(childProfile.id, welcomeBonusPoints);
    }

    // Create initial streak record
    console.log('[ChildProfileService.createChildProfile] Creating streak record');
    await prisma.streakRecord.create({
      data: {
        childProfileId: childProfile.id,
        currentDailyStreak: 0,
        currentWeeklyStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
      },
    });

    // Seed default tasks and rewards
    console.log('[ChildProfileService.createChildProfile] Seeding default tasks and rewards');
    try {
      await SeedService.seedDefaultData(childProfile.id, adminParentId);
      console.log('[ChildProfileService.createChildProfile] Successfully seeded default data');
    } catch (seedError) {
      console.error('[ChildProfileService.createChildProfile] Error seeding default data:', seedError);
      // Don't fail the entire operation if seeding fails
    }

    console.log('[ChildProfileService.createChildProfile] Returning child profile:', childProfile);
    return childProfile;
  }

  /**
   * Get child profile by ID
   */
  static async getChildProfileById(childProfileId: string) {
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: {
        adminParent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            parentReference: true,
          },
        },
        deliveryParent: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            parentReference: true,
          },
        },
        streakRecord: true,
      },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    return childProfile;
  }

  /**
   * Get all child profiles for a parent
   */
  static async getChildProfilesByParent(parentId: string) {
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        OR: [
          { adminParentId: parentId },
          { deliveryParentId: parentId },
        ],
        isArchived: false,
      },
      include: {
        adminParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deliveryParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        streakRecord: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return childProfiles;
  }

  /**
   * Update child profile
   */
  static async updateChildProfile(
    childProfileId: string,
    data: UpdateChildProfileDTO,
    userId: string
  ) {
    // Verify user has permission to update this child profile
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    if (childProfile.adminParentId !== userId) {
      throw new Error('Unauthorized to update this child profile');
    }

    // Update child profile
    const updated = await prisma.childProfile.update({
      where: { id: childProfileId },
      data,
      include: {
        adminParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deliveryParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Archive a child profile (soft delete)
   */
  static async archiveChildProfile(childProfileId: string, userId: string) {
    // Verify user has permission
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    if (childProfile.adminParentId !== userId) {
      throw new Error('Unauthorized to archive this child profile');
    }

    // Archive the profile
    const archived = await prisma.childProfile.update({
      where: { id: childProfileId },
      data: { isArchived: true },
    });

    return archived;
  }

  /**
   * Get child profile dashboard data
   */
  static async getChildDashboardData(childProfileId: string) {
    const childProfile = await this.getChildProfileById(childProfileId);

    // Get total points
    const totalPoints = await PointService.getTotalPoints(childProfileId);

    // Get active tasks count
    const activeTasks = await prisma.task.count({
      where: {
        childProfileId,
        isArchived: false,
      },
    });

    // Get pending claims count
    const pendingClaims = await prisma.taskClaim.count({
      where: {
        childProfileId,
        status: 'pending',
      },
    });

    // Get active rewards count
    const activeRewards = await prisma.reward.count({
      where: {
        childProfileId,
        isActive: true,
        isRetired: false,
      },
    });

    // Get pending redemptions count
    const pendingRedemptions = await prisma.rewardRedemption.count({
      where: {
        childProfileId,
        deliveredAt: null,
      },
    });

    return {
      childProfile,
      totalPoints,
      activeTasks,
      pendingClaims,
      activeRewards,
      pendingRedemptions,
    };
  }

  /**
   * Check if user has access to child profile
   */
  static async hasAccess(childProfileId: string, userId: string): Promise<boolean> {
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!childProfile) {
      return false;
    }

    // Allow access if user is the child, admin parent, or delivery parent
    return (
      childProfile.childUserId === userId ||
      childProfile.adminParentId === userId ||
      childProfile.deliveryParentId === userId
    );
  }

  /**
   * Add delivery parent to child profile
   */
  static async addDeliveryParent(
    childProfileId: string,
    deliveryParentId: string,
    adminParentId: string
  ) {
    // Verify admin parent owns this child profile
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    if (childProfile.adminParentId !== adminParentId) {
      throw new Error('Unauthorized to modify this child profile');
    }

    // Update delivery parent
    const updated = await prisma.childProfile.update({
      where: { id: childProfileId },
      data: { deliveryParentId },
      include: {
        adminParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        deliveryParent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated;
  }
}
