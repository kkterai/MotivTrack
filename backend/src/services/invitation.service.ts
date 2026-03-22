import prisma from '../config/database.js';
import crypto from 'crypto';
import { Role } from '@prisma/client';

interface CreateInvitationDTO {
  email: string;
  role: Role;
  invitedBy: string;
  childProfileId?: string;
  expiresInHours?: number;
}

export class InvitationService {
  /**
   * Generate a unique invitation token
   */
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create an invitation
   */
  static async createInvitation(data: CreateInvitationDTO) {
    const {
      email,
      role,
      invitedBy,
      childProfileId,
      expiresInHours = 72, // Default 72 hours
    } = data;

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        status: 'pending',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      // Return existing invitation if still valid
      return existingInvitation;
    }

    // Generate unique token
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role,
        invitedBy,
        childProfileId,
        expiresAt,
        status: 'pending',
      },
    });

    return invitation;
  }

  /**
   * Generate formatted email text for parent to send to child
   */
  static generateInvitationEmailText(
    childName: string,
    parentReference: string,
    token: string,
    appUrl: string = process.env.FRONTEND_URL || 'http://localhost:5173'
  ): { subject: string; body: string; link: string } {
    const registrationLink = `${appUrl}/claim-account?token=${token}`;
    
    const subject = `You're invited to MotivTrack!`;
    const body = `Hi ${childName}!

${parentReference} has set up MotivTrack for you! 🎉

MotivTrack helps you earn points by completing tasks and redeem them for rewards you choose. Your parent has already set up some tasks and rewards for you to get started.

Click the link below to create your account and start earning:

${registrationLink}

Once you're in, you'll be able to:
✅ See your tasks and claim them when you complete them
🎁 Choose rewards you want to earn
📊 Track your progress and points
🔥 Build streaks for bonus points!

See you inside!
- The MotivTrack Team`;

    return { subject, body, link: registrationLink };
  }

  /**
   * Validate an invitation token
   */
  static async validateToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new Error('Invitation has expired');
    }

    return invitation;
  }

  /**
   * Accept an invitation (mark as accepted)
   */
  static async acceptInvitation(token: string, userId: string) {
    const invitation = await this.validateToken(token);

    // Mark invitation as accepted
    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        acceptedBy: userId,
        acceptedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Resend an invitation (generate new token, extend expiry)
   */
  static async resendInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedBy !== userId) {
      throw new Error('Unauthorized to resend this invitation');
    }

    // Generate new token and extend expiry
    const newToken = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token: newToken,
        expiresAt,
        status: 'pending',
      },
    });

    return updated;
  }

  /**
   * Get all invitations sent by a user
   */
  static async getInvitationsByUser(userId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { invitedBy: userId },
      include: {
        childProfile: {
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

    return invitations;
  }

  /**
   * Cancel an invitation
   */
  static async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.invitedBy !== userId) {
      throw new Error('Unauthorized to cancel this invitation');
    }

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'cancelled' },
    });

    return updated;
  }
}
