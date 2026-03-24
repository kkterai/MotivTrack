import React from 'react';
import './ParentDashboardHero.css';
import { Button } from '../../ui/Button/Button';

/**
 * ParentDashboardHero - Hero section for parent dashboard
 * 
 * Shows parent greeting and logout action
 */

export function ParentDashboardHero({
  parentName,
  parentIcon = '👨‍👩‍👧',
  onLogout,
}) {
  return (
    <div className="parent-hero">
      <div className="parent-hero__container">
        <div className="parent-hero__profile">
          <div className="parent-hero__avatar">
            {parentIcon}
          </div>
          <div className="parent-hero__greeting">
            <h1 className="parent-hero__title">
              Parent Dashboard
            </h1>
            <p className="parent-hero__subtitle">
              {parentName}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="parent-hero__logout"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default ParentDashboardHero;
