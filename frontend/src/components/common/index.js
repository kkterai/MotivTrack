// Common components - centralized exports
// Backward-compatible exports that wrap the new design system components
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as ProgressBar } from './ProgressBar';

// These components don't have design system equivalents yet
export { default as Input } from './Input';
export { default as Modal } from './Modal';

// Re-export design system components for direct use
export { Button as DSButton } from '../ui/Button/Button';
export { Card as DSCard } from '../ui/Card/Card';
export { Badge as DSBadge } from '../ui/Badge/Badge';
export { Chip } from '../ui/Chip/Chip';
export { Pill } from '../ui/Pill/Pill';
export { Tabs } from '../ui/Tabs/Tabs';
export { ProgressBar as DSProgressBar } from '../ui/ProgressBar/ProgressBar';
export { EmptyState } from '../ui/EmptyState/EmptyState';
export { SectionHeader } from '../ui/SectionHeader/SectionHeader';
