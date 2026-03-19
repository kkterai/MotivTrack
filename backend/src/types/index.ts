import { Request } from 'express';
import { Role } from '@prisma/client';

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface CreateTaskDTO {
  childProfileId: string;
  title: string;
  doneStandard: string;
  extraWellDoneStandard: string;
  tips: string;
  pointsDone: number;
  pointsExtraWellDone: number;
  libraryTaskId?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  doneStandard?: string;
  extraWellDoneStandard?: string;
  tips?: string;
  pointsDone?: number;
  pointsExtraWellDone?: number;
}

// ============================================================================
// CLAIM TYPES
// ============================================================================

export interface CreateClaimDTO {
  taskId: string;
  childProfileId: string;
  claimType: 'done' | 'extra_well_done';
}

export interface VerifyClaimDTO {
  status: 'verified' | 'redo_requested';
  redoNote?: string;
}

// ============================================================================
// REWARD TYPES
// ============================================================================

export interface CreateRewardDTO {
  childProfileId: string;
  title: string;
  description: string;
  pointsCost: number;
}

export interface UpdateRewardDTO {
  title?: string;
  description?: string;
  pointsCost?: number;
  isActive?: boolean;
  isRetired?: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// METRICS TYPES
// ============================================================================

export interface StreakMetrics {
  currentDailyStreak: number;
  currentWeeklyStreak: number;
  longestStreak: number;
  lastCompletedDate: Date | null;
}

export interface PointsMetrics {
  totalPoints: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
  pointsBySource: Record<string, number>;
}

export interface ChildDashboardMetrics {
  points: PointsMetrics;
  streaks: StreakMetrics;
  tasksCompleted: number;
  tasksTotal: number;
  rewardsEarned: number;
}
