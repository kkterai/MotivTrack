import React from 'react';
import './EmptyState.css';
import { Button } from '../Button/Button';

/**
 * EmptyState Component - Design System Primitive
 * 
 * Shows when there's no content to display
 * 
 * Props:
 * - icon: Emoji or icon to display
 * - heading: Main heading text
 * - description: Short description
 * - action: Optional CTA button config { label, onClick }
 */

export function EmptyState({
  icon,
  heading,
  description,
  action,
  className = '',
  ...props
}) {
  const classes = [
    'ui-empty-state',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      {heading && <h3 className="ui-empty-state__heading">{heading}</h3>}
      {description && <p className="ui-empty-state__description">{description}</p>}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="ui-empty-state__action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
