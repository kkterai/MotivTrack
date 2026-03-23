import { useState } from 'react';
import { Button, Card } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * AssignmentPicker - Component for assigning tasks to specific dates
 * Allows parent to assign tasks to Today or Tomorrow
 *
 * @param {Object} task - Task object to assign
 * @param {Function} onAssign - Callback when task is assigned (date: 'today' | 'tomorrow')
 * @param {Array} existingAssignments - Array of existing assignments for this task
 * @param {string} childIcon - Icon to display on buttons (e.g., '🦊')
 * @param {boolean} compact - Use compact layout (default: false)
 */
export default function AssignmentPicker({
  task,
  onAssign,
  existingAssignments = [],
  childIcon = '👤',
  compact = false
}) {
  const [isAssigning, setIsAssigning] = useState(false);

  // Check if task is already assigned for today or tomorrow
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isAssignedToday = existingAssignments.some(assignment => {
    const assignedDate = new Date(assignment.assignedFor);
    assignedDate.setHours(0, 0, 0, 0);
    return assignedDate.getTime() === today.getTime();
  });

  const isAssignedTomorrow = existingAssignments.some(assignment => {
    const assignedDate = new Date(assignment.assignedFor);
    assignedDate.setHours(0, 0, 0, 0);
    return assignedDate.getTime() === tomorrow.getTime();
  });

  const handleAssign = async (date) => {
    setIsAssigning(true);
    try {
      await onAssign(date);
    } finally {
      setIsAssigning(false);
    }
  };

  if (compact) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant={isAssignedToday ? 'success' : 'secondary'}
          onClick={() => !isAssignedToday && handleAssign('today')}
          disabled={isAssigning || isAssignedToday}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            opacity: isAssignedToday ? 0.6 : 1,
          }}
        >
          {childIcon} {isAssignedToday ? 'Today' : 'Today'}
        </Button>
        <Button
          variant={isAssignedTomorrow ? 'success' : 'outline'}
          onClick={() => !isAssignedTomorrow && handleAssign('tomorrow')}
          disabled={isAssigning || isAssignedTomorrow}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            opacity: isAssignedTomorrow ? 0.6 : 1,
          }}
        >
          {childIcon} {isAssignedTomorrow ? 'Tomorrow' : 'Tomorrow'}
        </Button>
      </div>
    );
  }

  return (
    <Card style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px' }}>{task.icon || '📝'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
            {task.title}
            {task.taskType === 'SHARED' && (
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#10b981',
                backgroundColor: '#d1fae5',
                padding: '2px 6px',
                borderRadius: '8px',
              }}>
                👥 Shared
              </span>
            )}
          </div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            {task.pointsDone} pt{task.pointsDone !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: COLORS.textSecondary,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Assign To
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={isAssignedToday ? 'success' : 'primary'}
              onClick={() => !isAssignedToday && handleAssign('today')}
              disabled={isAssigning || isAssignedToday}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isAssignedToday ? 0.8 : 1,
                backgroundColor: isAssignedToday ? COLORS.success : COLORS.primary,
              }}
            >
              {childIcon} Today
            </Button>
            <Button
              variant={isAssignedTomorrow ? 'success' : 'outline'}
              onClick={() => !isAssignedTomorrow && handleAssign('tomorrow')}
              disabled={isAssigning || isAssignedTomorrow}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                opacity: isAssignedTomorrow ? 0.8 : 1,
                backgroundColor: isAssignedTomorrow ? COLORS.warning : 'transparent',
                color: isAssignedTomorrow ? 'white' : COLORS.textPrimary,
                border: isAssignedTomorrow ? 'none' : `2px solid ${COLORS.border}`,
              }}
            >
              {childIcon} Tomorrow
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
