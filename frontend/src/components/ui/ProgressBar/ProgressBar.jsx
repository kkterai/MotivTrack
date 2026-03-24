import React from 'react';
import './ProgressBar.css';

/**
 * ProgressBar Component - Design System Primitive
 * 
 * Shows progress with optional label and value
 * 
 * Props:
 * - value: Current value (0-100)
 * - max: Maximum value (default: 100)
 * - label: Optional label text
 * - showValue: Show numeric value (default: false)
 * - variant: 'default' | 'success' | 'warning'
 */

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  variant = 'default',
  className = '',
  ...props
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const classes = [
    'ui-progress',
    `ui-progress--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {(label || showValue) && (
        <div className="ui-progress__header">
          {label && <span className="ui-progress__label">{label}</span>}
          {showValue && (
            <span className="ui-progress__value">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className="ui-progress__track">
        <div
          className="ui-progress__fill"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label || 'Progress'}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
