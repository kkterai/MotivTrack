import React from 'react';
import './Tabs.css';

/**
 * Tabs Component - Design System Primitive
 * 
 * Underline-style tabs with brand primary or blue active state
 */

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  mode = 'parent', // 'parent' or 'child'
  ...props
}) {
  const classes = [
    'ui-tabs',
    `ui-tabs--${mode}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`ui-tabs__tab ${activeTab === tab.id ? 'ui-tabs__tab--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.icon && <span className="ui-tabs__icon">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
