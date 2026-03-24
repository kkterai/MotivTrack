import React from 'react';
import './SectionHeader.css';

/**
 * SectionHeader Component - Design System Primitive
 * 
 * Consistent section headers with optional action
 * 
 * Props:
 * - title: Section title
 * - subtitle: Optional subtitle
 * - action: Optional action element (button, link, etc.)
 * - serif: Use serif font for title (default: true)
 */

export function SectionHeader({
  title,
  subtitle,
  action,
  serif = true,
  className = '',
  ...props
}) {
  const classes = [
    'ui-section-header',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <div className="ui-section-header__content">
        <h2 className={`ui-section-header__title ${serif ? 'ui-section-header__title--serif' : ''}`}>
          {title}
        </h2>
        {subtitle && (
          <p className="ui-section-header__subtitle">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="ui-section-header__action">
          {action}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
