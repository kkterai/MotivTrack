// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Color Palette - Now using MotivTrack Design System
// Mapped to design system tokens for backward compatibility
export const COLORS = {
  // Design System Colors (Navy/Teal Theme)
  gradient: 'linear-gradient(135deg, #16324F, #2A6F97)', // Ink Navy to Ocean Blue
  
  // Semantic colors mapped to design system
  primary: '#1FA37A',        // Emerald Teal (success/completion)
  accent: '#E9C46A',         // Soft Gold (warmth/support)
  highlight: '#F4A261',      // Reward Orange (points/rewards)
  
  // UI neutrals / support colors
  textPrimary: '#1E2A36',    // Design system text primary
  textSecondary: '#4F5D6B',  // Design system text secondary
  background: '#FCFBF8',     // Design system surface page
  backgroundLight: '#F6F3EE', // Design system surface panel
  error: '#E76F51',          // Coral Red (destructive)
  white: '#FFFFFF',
  
  // Additional design system colors
  success: '#1FA37A',        // Emerald Teal
  successLight: '#D1FAE5',   // Light teal background
  primaryLight: '#E0F2FE',   // Light blue background
  
  // Border colors
  borderLight: '#E7EAEC',    // Design system border muted
  borderDefault: '#D7DDE2',  // Design system border default
  
  // Legacy aliases for backward compatibility
  gray: '#FCFBF8',
  grayDark: '#4F5D6B',
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
