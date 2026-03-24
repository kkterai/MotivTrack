import React from 'react';
import './Card.css';

/**
 * Card Component - Design System Primitive
 * 
 * Variants:
 * - default: Standard card with shadow
 * - panel: Panel background, no shadow
 * - elevated: Larger shadow for emphasis
 * - reward: Reward-themed styling
 */

export function Card({
  variant = 'default',
  className = '',
  children,
  onClick,
  hoverable = false,
  style = {},
  ...props
}) {
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    (onClick || hoverable) && 'ui-card--hoverable',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
