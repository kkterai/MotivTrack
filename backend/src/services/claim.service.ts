import prisma from '../config/database.js';
import { CreateClaimDTO, VerifyClaimDTO } from '../types/index.js';
import { PointService } from './point.service.js';
import { NotificationService } from './notification.service.js';

export class ClaimService {
  /**
   * Create a task claim (child marks task as complete)
   */
  static async createClaim(data: CreateClaimDTO, childId: string) {
    console.log('Creating claim with data:', { data, childId });
    
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

    console.log('Task found:', task ? { id: task.id, childProfileId: task.childProfileId } : 'null');

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.childProfileId !== data.childProfileId) {
      console.error('Child profile mismatch:', {
        taskChildProfileId: task.childProfileId,
        dataChildProfileId: data.childProfileId
      });
      throw new Error('Task does not belong to this child');
    }

    // Check if there's already a pending claim for this task
    const existingClaim = await prisma.taskClaim.findFirst({
      where: {
        taskId: data.taskId,
        status: 'pending',
      },
    });

    console.log('Existing claim check:', existingClaim ? 'Found existing claim' : 'No existing claim');

    if (existingClaim) {
      throw new Error('Task already has a pending claim');
    }

    // Create the claim
    console.log('Creating claim in database with:', {
      taskId: data.taskId,
      childId,
      childProfileId: data.childProfileId,
      claimType: data.claimType,
      status: 'pending',
    });

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

    console.log('Claim created successfully:', claim.id);

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
        task: {
          include: {
            childProfile: true, // Include child profile to get siblings
          },
        },
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

      // SHARED TASK LOGIC: If this is a shared task, auto-complete it for all siblings
      if (claim.task.taskType === 'SHARED') {
        await this.autoCompleteSharedTaskForSiblings(claim);
      }
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
        claimedAt: 'desc',
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

    const pendingClaims = await prisma.taskClaim.findMany({
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
        claimedAt: 'asc',
      },
    });

    return pendingClaims;
  }

  /**
   * Auto-complete shared tasks for siblings when one child completes it
   * This is called after a shared task claim is verified
   */
  private static async autoCompleteSharedTaskForSiblings(claim: any) {
    try {
      // Get all siblings (children with the same admin parent)
      const siblings = await prisma.childProfile.findMany({
        where: {
          adminParentId: claim.task.childProfile.adminParentId,
          id: { not: claim.childProfileId }, // Exclude the child who completed it
          isArchived: false,
        },
        include: {
          childUser: true, // Include user for notifications
        },
      });

      // Get the date of the claim (normalize to midnight UTC)
      const claimDate = new Date(claim.claimedAt);
      claimDate.setUTCHours(0, 0, 0, 0);

      // For each sibling, check if they have this task assigned for the same date
      for (const sibling of siblings) {
        // Check if there's a task assignment for this sibling for the same date
        const assignment = await prisma.taskAssignment.findFirst({
          where: {
            taskId: claim.taskId,
            childProfileId: sibling.id,
            assignedFor: claimDate,
          },
        });

        if (assignment) {
          // Mark the assignment as completed
          await prisma.taskAssignment.update({
            where: { id: assignment.id },
            data: { completedAt: new Date() },
          });

          // Send notification to the sibling
          if (sibling.childUser) {
            await NotificationService.sendNotification({
              userId: sibling.childUser.id,
              type: 'task_auto_completed',
              payload: {
                title: `${claim.child.name} completed a shared task! ✓`,
                body: `${claim.task.title} - This task is now complete for everyone.`,
                actionUrl: '/child/dashboard',
                metadata: {
                  taskId: claim.taskId,
                  taskTitle: claim.task.title,
                  completedBy: claim.child.name,
                  completedByChildProfileId: claim.childProfileId,
                },
              },
            });
          }
        }
      }

      console.log(`[ClaimService] Auto-completed shared task "${claim.task.title}" for ${siblings.length} siblings`);
    } catch (error) {
      console.error('[ClaimService] Error auto-completing shared task for siblings:', error);
      // Don't throw - we don't want to fail the main claim verification if this fails
    }
  }
}
