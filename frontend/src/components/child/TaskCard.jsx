import { useState } from 'react';
import { Button, Card, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * TaskCard - Individual task card with expandable details
 * Preserves exact styling and functionality from original App.jsx
 * 
 * @param {Object} task - Task object with id, label, pts, status, icon, desc, tips, done, extraWellDone
 * @param {Function} onSubmit - Callback when task is submitted
 * @param {boolean} readOnly - If true, disables all interactions
 */
export default function TaskCard({ task, onSubmit, readOnly = false }) {
  const [expanded, setExpanded] = useState(false);
  const [quality, setQuality] = useState('done');

  const handleSubmit = () => {
    if (readOnly) return;
    onSubmit(task.id, quality);
    setExpanded(false);
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <Badge variant="pending" size="small">To Do</Badge>;
      case 'awaiting':
        return <Badge variant="warning" size="small">Awaiting Review</Badge>;
      case 'approved':
        return <Badge variant="verified" size="small">✓ Approved</Badge>;
      case 'redo':
        return <Badge variant="redo" size="small">Needs Redo</Badge>;
      default:
        return null;
    }
  };

  const canSubmit = task.status === 'pending' || task.status === 'redo';

  return (
    <Card 
      hoverable={!readOnly && canSubmit}
      style={{ marginBottom: '12px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '32px' }}>{task.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
              {task.label}
            </span>
            {getStatusBadge()}
          </div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
            {task.pts} {task.pts === 1 ? 'point' : 'points'}
          </div>
        </div>
        {canSubmit && !readOnly && (
          <Button
            variant="primary"
            onClick={() => setExpanded(!expanded)}
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            {expanded ? 'Close' : 'Start'}
          </Button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${COLORS.background}` }}>
          {/* Description */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: COLORS.textPrimary, marginBottom: '4px' }}>
              What to do:
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              {task.desc}
            </div>
          </div>

          {/* Tips */}
          {task.tips && task.tips.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: COLORS.textPrimary, marginBottom: '4px' }}>
                💡 Tips:
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: COLORS.textSecondary }}>
                {task.tips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quality Selection */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: COLORS.textPrimary, marginBottom: '8px' }}>
              How well did you do it?
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Done Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '12px',
                  background: quality === 'done' ? COLORS.background : 'white',
                  border: `2px solid ${quality === 'done' ? COLORS.primary : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: readOnly ? 'not-allowed' : 'pointer',
                  opacity: readOnly ? 0.6 : 1,
                }}
              >
                <input
                  type="radio"
                  name={`quality-${task.id}`}
                  value="done"
                  checked={quality === 'done'}
                  onChange={(e) => !readOnly && setQuality(e.target.value)}
                  disabled={readOnly}
                  style={{ marginTop: '2px', cursor: readOnly ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: COLORS.textPrimary }}>
                    ✓ Done ({task.pts} {task.pts === 1 ? 'point' : 'points'})
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '2px' }}>
                    {task.done}
                  </div>
                </div>
              </label>

              {/* Extra Well Done Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '12px',
                  background: quality === 'extraWellDone' ? COLORS.background : 'white',
                  border: `2px solid ${quality === 'extraWellDone' ? COLORS.primary : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: readOnly ? 'not-allowed' : 'pointer',
                  opacity: readOnly ? 0.6 : 1,
                }}
              >
                <input
                  type="radio"
                  name={`quality-${task.id}`}
                  value="extraWellDone"
                  checked={quality === 'extraWellDone'}
                  onChange={(e) => !readOnly && setQuality(e.target.value)}
                  disabled={readOnly}
                  style={{ marginTop: '2px', cursor: readOnly ? 'not-allowed' : 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: COLORS.textPrimary }}>
                    ⭐ Extra Well Done ({Math.round(task.pts * 1.5)} points)
                  </div>
                  <div style={{ fontSize: '13px', color: COLORS.textSecondary, marginTop: '2px' }}>
                    {task.extraWellDone}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="success"
            fullWidth
            onClick={handleSubmit}
            disabled={readOnly}
          >
            Submit Task
          </Button>
        </div>
      )}
    </Card>
  );
}
