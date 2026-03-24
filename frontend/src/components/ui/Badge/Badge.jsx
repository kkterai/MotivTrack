import React from 'react';
import './Badge.css';

/**
 * Badge Component - Design System Primitive
 * 
 * Read-only semantic indicators for task/reward status
 * 
 * Variants:
 * - completed: Task completed
 * - pending: Awaiting review
 * - overdue: Past deadline
 * - declined: Rejected
 * - archived: Archived
 * - draft: Draft state
 * - verified: Approved/verified
 * - redo_requested: Needs to be redone
 */

export function Badge({
  variant = 'pending',
  className = '',
  children,
  ...props
}) {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export default Badge;
