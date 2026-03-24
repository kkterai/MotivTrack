import React from 'react';
import './Button.css';

/**
 * Button Component - Design System Primitive
 * 
 * Variants:
 * - primary: Ink Navy (brand primary)
 * - secondary: White with border
 * - success: Emerald Teal
 * - destructive: Coral Red
 * - ghost: Transparent
 * 
 * Note: Reward Orange is NOT a standard button variant
 */

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth && 'ui-button--full-width',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
