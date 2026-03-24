import React from 'react';
import './ChildDashboardHero.css';
import { ProgressBar } from '../../ui/ProgressBar/ProgressBar';
import { Pill } from '../../ui/Pill/Pill';

/**
 * ChildDashboardHero - Hero section for child dashboard
 * 
 * Shows greeting, points, and progress
 */

export function ChildDashboardHero({
  childName,
  childIcon = '🦊',
  totalPoints = 0,
  tasksCompleted = 0,
  totalTasks = 0,
  greeting = 'Keep crushing it today',
}) {
  return (
    <div className="child-hero">
      <div className="child-hero__container">
        <div className="child-hero__header">
          <div className="child-hero__profile">
            <div className="child-hero__avatar">
              {childIcon}
            </div>
            <div className="child-hero__greeting">
              <h1 className="child-hero__title">
                Hey, {childName}!
              </h1>
              <p className="child-hero__subtitle">
                {greeting}
              </p>
            </div>
          </div>
          <Pill variant="points" className="child-hero__points">
            {totalPoints} <span className="child-hero__points-label">PTS</span>
          </Pill>
        </div>

        <div className="child-hero__progress">
          <ProgressBar
            value={tasksCompleted}
            max={totalTasks}
            label="TASKS DONE"
            showValue={true}
            variant="success"
          />
        </div>
      </div>
    </div>
  );
}

export default ChildDashboardHero;
