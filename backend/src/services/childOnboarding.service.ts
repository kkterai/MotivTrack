import prisma from '../config/database.js';
import { PointService } from './point.service.js';
import { NotificationService } from './notification.service.js';

interface SaveRewardPreferencesDTO {
  childProfileId: string;
  categories: string[];
  otherCategory?: string;
  specificReward?: string;
}

export class ChildOnboardingService {
  /**
   * Save child's reward preferences from onboarding survey
   */
  static async saveRewardPreferences(data: SaveRewardPreferencesDTO) {
    const { childProfileId, categories, otherCategory, specificReward } = data;

    // Get current school year (simple implementation)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // School year starts in August (month 7)
    const schoolYear = month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    // Build preferences array
    const preferences = [...categories];
    
    // Build free text combining other category and specific reward
    let freeText = '';
    if (otherCategory) {
      freeText += `Other category: ${otherCategory}\n`;
    }
    if (specificReward) {
      freeText += `Specific reward: ${specificReward}`;
    }

    // Save reward preference
    const rewardPreference = await prisma.rewardPreference.create({
      data: {
        childProfileId,
        schoolYear,
        preferences,
        freeText: freeText || null,
      },
    });

    return rewardPreference;
  }

  /**
   * Award onboarding bonus points (3 points)
   */
  static async awardOnboardingBonus(childProfileId: string) {
    const ONBOARDING_POINTS = 3;

    // Use welcome_bonus source for onboarding points
    await PointService.awardWelcomeBonus(childProfileId, ONBOARDING_POINTS);

    return { points: ONBOARDING_POINTS };
  }

  /**
   * Complete child onboarding process
   * - Save reward preferences
   * - Award onboarding points
   * - Notify parent
   */
  static async completeOnboarding(data: SaveRewardPreferencesDTO) {
    const { childProfileId } = data;

    // Get child profile with admin parent info
    const childProfile = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
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

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    // Save reward preferences
    const preferences = await this.saveRewardPreferences(data);

    // Award onboarding bonus
    const bonus = await this.awardOnboardingBonus(childProfileId);

    // Send notification to child about welcome bonus
    // @ts-ignore - childUserId exists in schema but types may not be regenerated
    if (childProfile.childUserId) {
      await NotificationService.sendNotification({
        // @ts-ignore
        userId: childProfile.childUserId,
        type: 'points_awarded',
        payload: {
          title: '🎉 Welcome bonus!',
          body: `You earned ${bonus.points} points just for getting started! Keep going to earn more.`,
          actionUrl: '/child',
          metadata: {
            points: bonus.points,
            source: 'welcome_bonus',
          },
        },
      });
    }

    // TODO: Notify parent that child has joined
    // This can be implemented later with a proper notification system
    // For now, the parent will see the child's activity in their dashboard

    return {
      preferences,
      bonus,
      childProfile,
    };
  }

  /**
   * Get child's onboarding status
   */
  static async getOnboardingStatus(childProfileId: string) {
    // Check if child has completed onboarding by looking for reward preferences
    const rewardPreference = await prisma.rewardPreference.findFirst({
      where: { childProfileId },
      orderBy: { createdAt: 'desc' },
    });

    // Check if child has received onboarding points
    const onboardingPoints = await prisma.pointTransaction.findFirst({
      where: {
        childProfileId,
        source: 'welcome_bonus', // Using welcome_bonus as onboarding bonus
        amount: 3,
      },
    });

    return {
      hasCompletedSurvey: !!rewardPreference,
      hasReceivedOnboardingPoints: !!onboardingPoints,
      isComplete: !!rewardPreference && !!onboardingPoints,
    };
  }
}
