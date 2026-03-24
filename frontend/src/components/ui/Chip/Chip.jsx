import React from 'react';
import './Chip.css';

/**
 * Chip Component - Design System Primitive
 * 
 * Interactive filters/tags
 * 
 * Variants:
 * - selected: Active/selected state
 * - unselected: Inactive state
 * - dismissible: Can be removed
 * - disabled: Disabled state
 */

export function Chip({
  variant = 'unselected',
  className = '',
  children,
  onDismiss,
  onClick,
  disabled = false,
  ...props
}) {
  const classes = [
    'ui-chip',
    `ui-chip--${variant}`,
    (onClick || onDismiss) && 'ui-chip--interactive',
    disabled && 'ui-chip--disabled',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) onClick(e);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onDismiss) onDismiss(e);
  };

  return (
    <span
      className={classes}
      onClick={handleClick}
      {...props}
    >
      {children}
      {onDismiss && (
        <button
          type="button"
          className="ui-chip__dismiss"
          onClick={handleDismiss}
          disabled={disabled}
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Chip;
