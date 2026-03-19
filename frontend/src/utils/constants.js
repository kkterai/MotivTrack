// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Color Palette (from UI_UX_SPEC.md - Google Classroom + Joyful Holly)
export const COLORS = {
  // Joyful Holly Gradient
  gradient: 'linear-gradient(to right, #146735, #EAFDD8)',

  // Google Classroom official brand colors
  primary: '#25A667',        // Classroom green
  accent: '#57BB8A',         // Secondary Classroom green
  highlight: '#F6BB18',      // Classroom yellow

  // UI neutrals / support colors
  textPrimary: '#202124',
  textSecondary: '#5f6368',
  background: '#f8f9fa',
  error: '#d93025',
  white: '#ffffff',
  
  // Legacy aliases for backward compatibility (will be removed)
  gray: '#f8f9fa',
  grayDark: '#5f6368',
};

// User Roles
export const ROLES = {
  ADMIN_PARENT: 'admin_parent',
  DELIVERY_PARENT: 'delivery_parent',
  CHILD: 'child',
  TEACHER: 'teacher',
};

// Task Categories
export const TASK_CATEGORIES = {
  KITCHEN: 'kitchen',
  BATHROOM: 'bathroom',
  BEDROOM: 'bedroom',
  LAUNDRY: 'laundry',
  OUTDOOR: 'outdoor',
  GENERAL: 'general',
};

// Claim Types
export const CLAIM_TYPES = {
  DONE: 'done',
  EXTRA_WELL_DONE: 'extra_well_done',
};

// Claim Status
export const CLAIM_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REDO_REQUESTED: 'redo_requested',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_CLAIM_PENDING: 'task_claim_pending',
  VERIFICATION_REMINDER: 'verification_reminder',
  POINTS_AWARDED: 'points_awarded',
  REWARD_REDEEMED: 'reward_redeemed',
  REWARD_DELIVERY_REMINDER: 'reward_delivery_reminder',
  TEACHER_REMINDER: 'teacher_reminder',
  STREAK_MILESTONE: 'streak_milestone',
  ANNUAL_SURVEY: 'annual_survey',
};

// Behavior Rating Scale
export const BEHAVIOR_SCALE = [
  { value: 1, label: 'Needs Support', emoji: '😟', color: COLORS.error },
  { value: 2, label: 'Developing', emoji: '😐', color: COLORS.highlight },
  { value: 3, label: 'Meeting', emoji: '🙂', color: COLORS.accent },
  { value: 4, label: 'Exceeding', emoji: '🌟', color: COLORS.primary },
];

// Streak Milestones (for bonus points)
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90];

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'motivtrack_token',
  USER_DATA: 'motivtrack_user',
  THEME: 'motivtrack_theme',
};

// Animation Durations (ms)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  CONFETTI: 3000,
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
};
