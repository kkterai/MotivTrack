/**
 * MotivTrack Design System - Type Definitions
 * 
 * Shared types for component variants and props
 */

/**
 * Button variants
 */
export type ButtonVariant = "primary" | "secondary" | "success" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Card variants
 */
export type CardVariant = "default" | "panel" | "elevated" | "reward";

/**
 * Badge variants (read-only semantic indicators)
 */
export type BadgeVariant = 
  | "completed" 
  | "pending" 
  | "overdue" 
  | "declined" 
  | "archived" 
  | "draft"
  | "verified"
  | "redo_requested";

/**
 * Chip variants (interactive filters/tags)
 */
export type ChipVariant = "selected" | "unselected" | "dismissible" | "disabled";

/**
 * Pill variants (compact metrics)
 */
export type PillVariant = "points" | "count" | "streak" | "label";

/**
 * Progress bar variants
 */
export type ProgressBarVariant = "default" | "success" | "warning";

/**
 * Mode types for parent vs child views
 */
export type AppMode = "parent" | "child";

/**
 * Task status types
 */
export type TaskStatus = 
  | "pending" 
  | "approved" 
  | "redeemed" 
  | "overdue" 
  | "archived" 
  | "declined" 
  | "completed";
