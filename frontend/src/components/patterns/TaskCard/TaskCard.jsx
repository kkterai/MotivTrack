import React from 'react';
import './TaskCard.css';
import { Card } from '../../ui/Card/Card';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';
import { Pill } from '../../ui/Pill/Pill';

/**
 * TaskCard - Displays a task with status and actions
 * 
 * Used in child dashboard to show assigned tasks
 */

export function TaskCard({
  task,
  claim,
  isExpanded = false,
  onToggle,
  onSubmit,
  submitting = false,
}) {
  const tips = Array.isArray(task.tips) ? task.tips : (task.tips ? [task.tips] : []);
  
  // Determine task status based on claim
  const hasPendingClaim = claim && claim.status === 'pending';
  const isVerified = claim && claim.status === 'verified';
  const needsRedo = claim && claim.status === 'redo_requested';
  
  // Check if task was auto-completed by a sibling (shared task with completedAt but no claim)
  const isAutoCompleted = task.taskType === 'SHARED' &&
                          task.taskAssignments?.[0]?.completedAt &&
                          !claim;
  
  const isInteractive = !hasPendingClaim && !isVerified && !isAutoCompleted;

  return (
    <Card
      className={`task-card ${needsRedo ? 'task-card--redo' : ''} ${isVerified || isAutoCompleted ? 'task-card--verified' : ''} ${hasPendingClaim ? 'task-card--pending' : ''}`}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Task Header */}
      <div
        onClick={isInteractive ? onToggle : undefined}
        className={`task-card__header ${isInteractive ? 'task-card__header--interactive' : ''} ${isExpanded ? 'task-card__header--expanded' : ''}`}
      >
        <div className="task-card__icon">{task.icon || '📋'}</div>
        <div className="task-card__content">
          <h3 className="task-card__title">
            {task.title}
            {task.taskType === 'SHARED' && !isAutoCompleted && (
              <Badge variant="completed" className="task-card__shared-badge">
                👥 Shared
              </Badge>
            )}
          </h3>
          <p className="task-card__description">
            {task.doneStandard?.substring(0, 60)}{task.doneStandard?.length > 60 ? '...' : ''}
          </p>
        </div>
        
        {/* Status Badge */}
        <div className="task-card__status">
          {hasPendingClaim && (
            <Badge variant="pending">⏳ Pending Review</Badge>
          )}
          {isAutoCompleted && (
            <Badge variant="completed">👥 Done by Sibling!</Badge>
          )}
          {isVerified && !isAutoCompleted && (
            <Badge variant="verified">✓ Approved!</Badge>
          )}
          {needsRedo && (
            <Badge variant="redo_requested">🔄 Try Again</Badge>
          )}
          {!hasPendingClaim && !isVerified && !needsRedo && !isAutoCompleted && (
            <Pill variant="points">
              +{task.pointsDone}pt {task.pointsExtraWellDone > 0 && `▲`}
            </Pill>
          )}
        </div>
      </div>

      {/* Redo Note */}
      {needsRedo && claim.redoNote && (
        <div className="task-card__redo-note">
          <div className="task-card__redo-label">Parent's Note:</div>
          <div className="task-card__redo-text">{claim.redoNote}</div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && isInteractive && (
        <div className="task-card__expanded">
          {/* Tips */}
          {tips.length > 0 && (
            <div className="task-card__tips">
              <div className="task-card__tips-label">💡 TIPS</div>
              {tips.map((tip, idx) => (
                <div key={idx} className="task-card__tip">
                  {tip}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="task-card__actions">
            <Button
              variant="success"
              onClick={() => onSubmit(task.id, 'done')}
              disabled={submitting}
              fullWidth
              className="task-card__action-button"
            >
              ✓ Done<br />
              <span className="task-card__action-points">+{task.pointsDone} pts</span>
            </Button>

            {task.pointsExtraWellDone > 0 && (
              <Button
                variant="secondary"
                onClick={() => onSubmit(task.id, 'extra_well_done')}
                disabled={submitting}
                fullWidth
                className="task-card__action-button"
              >
                ⭐ Extra Well Done<br />
                <span className="task-card__action-points">+{task.pointsDone + task.pointsExtraWellDone} pts</span>
              </Button>
            )}
          </div>

          {/* Standards */}
          <div className="task-card__standards">
            <div className="task-card__standard">
              <strong>✓ Done means...</strong><br />
              {task.doneStandard}
            </div>
            {task.extraWellDoneStandard && (
              <div className="task-card__standard">
                <strong>⭐ Extra well done...</strong><br />
                {task.extraWellDoneStandard}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default TaskCard;
