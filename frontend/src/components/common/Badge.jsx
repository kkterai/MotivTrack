import { COLORS } from '../../utils/constants';

/**
 * Badge component for status indicators
 * Preserves exact styling from original App.jsx
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'medium',
}) {
  const variants = {
    default: {
      background: COLORS.background,
      color: COLORS.textSecondary,
    },
    primary: {
      background: COLORS.primary,
      color: 'white',
    },
    success: {
      background: COLORS.primary,
      color: 'white',
    },
    warning: {
      background: COLORS.highlight,
      color: COLORS.textPrimary,
    },
    danger: {
      background: COLORS.error,
      color: 'white',
    },
    pending: {
      background: COLORS.highlight,
      color: COLORS.textPrimary,
    },
    verified: {
      background: COLORS.primary,
      color: 'white',
    },
    redo: {
      background: COLORS.error,
      color: 'white',
    },
  };

  const sizes = {
    small: {
      padding: '4px 8px',
      fontSize: '12px',
    },
    medium: {
      padding: '6px 12px',
      fontSize: '14px',
    },
    large: {
      padding: '8px 16px',
      fontSize: '16px',
    },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: '12px',
        fontWeight: '600',
        ...variants[variant],
        ...sizes[size],
      }}
    >
      {children}
    </span>
  );
}
