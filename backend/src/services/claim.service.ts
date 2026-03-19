import prisma from '../config/database.js';
import { CreateClaimDTO, VerifyClaimDTO } from '../types/index.js';
import { PointService } from './point.service.js';
import { NotificationService } from './notification.service.js';

export class ClaimService {
  /**
   * Create a task claim (child marks task as complete)
   */
  static async createClaim(data: CreateClaimDTO, childId: string) {
    // Verify task exists and belongs to this child
    const task = await prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        childProfile: {
          include: {
            adminParent: true,
            deliveryParent: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.childProfileId !== data.childProfileId) {
      throw new Error('Task does not belong to this child');
    }

    // Check if there's already a pending claim for this task
    const existingClaim = await prisma.taskClaim.findFirst({
      where: {
        taskId: data.taskId,
        status: 'pending',
      },
    });

    if (existingClaim) {
      throw new Error('Task already has a pending claim');
    }

    // Create the claim
    const claim = await prisma.taskClaim.create({
      data: {
        taskId: data.taskId,
        childId,
        childProfileId: data.childProfileId,
        claimType: data.claimType,
        status: 'pending',
      },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Send notification to admin parent
    await NotificationService.sendNotification({
      userId: task.childProfile.adminParentId,
      type: 'task_claim_pending',
      payload: {
        title: `${task.childProfile.name} marked a task done`,
        body: `${task.title} - ${data.claimType === 'done' ? 'Done' : 'Extra Well Done'}. Tap to verify.`,
        actionUrl: `/parent/verify/${claim.id}`,
        metadata: {
          claimId: claim.id,
          taskId: task.id,
          childName: task.childProfile.name,
          taskTitle: task.title,
          claimType: data.claimType,
        },
      },
    });

    return claim;
  }

  /**
   * Verify a task claim (parent approves)
   */
  static async verifyClaim(
    claimId: string,
    data: VerifyClaimDTO,
    verifiedBy: string
  ) {
    // Get the claim
    const claim = await prisma.taskClaim.findUnique({
      where: { id: claimId },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          include: {
            adminParent: true,
          },
        },
      },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    // Only admin parent can verify
    if (claim.childProfile.adminParentId !== verifiedBy) {
      throw new Error('Only admin parent can verify claims');
    }

    // Can only verify pending claims
    if (claim.status !== 'pending') {
      throw new Error('Claim is not pending');
    }

    // Update the claim
    const updatedClaim = await prisma.taskClaim.update({
      where: { id: claimId },
      data: {
        status: data.status,
        verifiedAt: data.status === 'verified' ? new Date() : null,
        verifiedBy: data.status === 'verified' ? verifiedBy : null,
        redoNote: data.redoNote,
      },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If verified, award points
    if (data.status === 'verified') {
      const pointsToAward =
        claim.claimType === 'extra_well_done'
          ? claim.task.pointsExtraWellDone
          : claim.task.pointsDone;

      await PointService.awardPoints({
        childProfileId: claim.childProfileId,
        amount: pointsToAward,
        source: 'task_claim',
        referenceTaskClaimId: claim.id,
      });

      // Send notification to child
      await NotificationService.sendNotification({
        userId: claim.childId,
        type: 'points_awarded',
        payload: {
          title: `${claim.childProfile.adminParent.name} confirmed it! +${pointsToAward} points ✓`,
          body: `${claim.task.title} - ${claim.claimType === 'done' ? 'Done' : 'Extra Well Done'}. You now have points toward your reward!`,
          actionUrl: '/child/dashboard',
          metadata: {
            claimId: claim.id,
            taskId: claim.task.id,
            taskTitle: claim.task.title,
            pointsAwarded: pointsToAward,
            claimType: claim.claimType,
          },
        },
      });
    } else if (data.status === 'redo_requested') {
      // Send notification to child about redo request
      await NotificationService.sendNotification({
        userId: claim.childId,
        type: 'task_claim_pending',
        payload: {
          title: 'Try again',
          body: `${claim.task.title} - ${data.redoNote || 'Please redo this task'}`,
          actionUrl: '/child/dashboard',
          metadata: {
            claimId: claim.id,
            taskId: claim.task.id,
            taskTitle: claim.task.title,
            redoNote: data.redoNote,
          },
        },
      });
    }

    return updatedClaim;
  }

  /**
   * Get pending claims for a parent
   */
  static async getPendingClaims(parentId: string) {
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

    // Get pending claims for these children
    const claims = await prisma.taskClaim.findMany({
      where: {
        childProfileId: {
          in: childProfileIds,
        },
        status: 'pending',
      },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        claimedAt: 'asc', // Oldest first
      },
    });

    return claims;
  }

  /**
   * Get claim history for a child
   */
  static async getClaimHistory(childProfileId: string, limit = 50) {
    const claims = await prisma.taskClaim.findMany({
      where: {
        childProfileId,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            pointsDone: true,
            pointsExtraWellDone: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        claimedAt: 'desc',
      },
      take: limit,
    });

    return claims;
  }

  /**
   * Get claim by ID
   */
  static async getClaimById(claimId: string) {
    const claim = await prisma.taskClaim.findUnique({
      where: { id: claimId },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          select: {
            id: true,
            name: true,
            adminParentId: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    return claim;
  }

  /**
   * Get all claims for a child (with optional status filter)
   */
  static async getClaimsByChild(
    childProfileId: string,
    status?: 'pending' | 'verified' | 'redo_requested'
  ) {
    const where: any = { childProfileId };
    
    if (status) {
      where.status = status;
    }

    return await prisma.taskClaim.findMany({
      where,
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        verifier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get pending claims for a parent to review
   */
  static async getPendingClaimsForParent(parentId: string) {
    // Get all child profiles where this user is admin or delivery parent
    const childProfiles = await prisma.childProfile.findMany({
      where: {
        OR: [
          { adminParentId: parentId },
          { deliveryParentId: parentId },
        ],
      },
    });

    const childProfileIds = childProfiles.map(cp => cp.id);

    return await prisma.taskClaim.findMany({
      where: {
        childProfileId: { in: childProfileIds },
        status: 'pending',
      },
      include: {
        task: true,
        child: {
          select: {
            id: true,
            name: true,
          },
        },
        childProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
