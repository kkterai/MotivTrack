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
      background: COLORS.gray,
      color: COLORS.grayDark,
    },
    primary: {
      background: COLORS.purple,
      color: 'white',
    },
    success: {
      background: COLORS.green,
      color: 'white',
    },
    warning: {
      background: COLORS.yellow,
      color: '#333',
    },
    danger: {
      background: COLORS.red,
      color: 'white',
    },
    pending: {
      background: COLORS.yellow,
      color: '#333',
    },
    verified: {
      background: COLORS.green,
      color: 'white',
    },
    redo: {
      background: COLORS.red,
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
