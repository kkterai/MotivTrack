import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../config/database.js';
import { JWTPayload } from '../types/index.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    email: string,
    password: string,
    role: Role,
    name?: string
  ) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        name,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      token,
    };
  }

  /**
   * Generate JWT token
   */
  static generateToken(userId: string, email: string, role: Role): string {
    const payload: JWTPayload = {
      userId,
      email,
      role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }
}
