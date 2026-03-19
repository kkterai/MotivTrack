// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Color Palette (Preserve Exactly from Original)
export const COLORS = {
  // Gradients
  purpleGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  greenGradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  yellowGradient: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  redGradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
  
  // Solid colors
  purple: '#667eea',
  purpleDark: '#764ba2',
  green: '#84fab0',
  greenLight: '#8fd3f4',
  yellow: '#ffeaa7',
  yellowDark: '#fdcb6e',
  red: '#ff6b6b',
  redDark: '#ee5a6f',
  gray: '#f3f4f6',
  grayMedium: '#9ca3af',
  grayDark: '#6b7280',
  white: '#ffffff',
  black: '#000000',
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
  { value: 1, label: 'Needs Support', emoji: '😟', color: COLORS.red },
  { value: 2, label: 'Developing', emoji: '😐', color: COLORS.yellow },
  { value: 3, label: 'Meeting', emoji: '🙂', color: COLORS.green },
  { value: 4, label: 'Exceeding', emoji: '🌟', color: COLORS.purple },
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
