import React from 'react';
import './Pill.css';

/**
 * Pill Component - Design System Primitive
 * 
 * Compact metrics display
 * 
 * Variants:
 * - points: Point values
 * - count: Numeric counts
 * - streak: Streak indicators
 * - label: Generic labels
 */

export function Pill({
  variant = 'label',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'ui-pill',
    `ui-pill--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export default Pill;
