import { COLORS } from '../../utils/constants';

/**
 * Reusable Button component with variants
 * Preserves exact styling from original App.jsx
 */
export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      background: COLORS.purpleGradient,
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    },
    secondary: {
      background: COLORS.greenGradient,
      color: 'white',
      boxShadow: '0 4px 12px rgba(132, 250, 176, 0.4)',
    },
    success: {
      background: COLORS.greenGradient,
      color: 'white',
      boxShadow: '0 4px 12px rgba(132, 250, 176, 0.4)',
    },
    warning: {
      background: COLORS.yellowGradient,
      color: '#333',
      boxShadow: '0 4px 12px rgba(255, 234, 167, 0.4)',
    },
    danger: {
      background: COLORS.redGradient,
      color: 'white',
      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)',
    },
    outline: {
      background: 'transparent',
      color: COLORS.purple,
      border: `2px solid ${COLORS.purple}`,
      boxShadow: 'none',
    },
  };

  const hoverStyles = !disabled ? {
    transform: 'translateY(-2px)',
    boxShadow: variants[variant].boxShadow?.replace('0.4', '0.6'),
  } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...baseStyles,
        ...variants[variant],
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.target.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = variants[variant].boxShadow;
        }
      }}
    >
      {children}
    </button>
  );
}
