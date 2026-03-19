import { Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * TeacherReportCard - Displays teacher behavior feedback
 * Shows when child has earned points from teacher review
 * Preserves exact styling from original App.jsx
 * 
 * @param {Object} report - Report object with teacher, date, ratings, points, feedback
 */
export default function TeacherReportCard({ report }) {
  if (!report) return null;

  const SCALE = [
    { label: 'Needs Work', emoji: '', color: COLORS.highlight},
    { label: 'Getting There', emoji: '', color: COLORS.highlight },
    { label: 'Good (75%)', emoji: '🙂', color: COLORS.accent },
    { label: 'Great (100%)', emoji: '😊', color: COLORS.primary },
    { label: 'Above and Beyond', emoji: '🌟', color: COLORS.primary },
  ];

  const getRatingDisplay = (rating) => {
    const scale = SCALE[rating - 1];
    return scale || SCALE[2]; // Default to "Good" if invalid
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '16px',
        border: `2px solid ${COLORS.primary}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px' }}>👩‍🏫</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
            Teacher Feedback
          </div>
          <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>
            {report.teacher} • {report.date}
          </div>
        </div>
        <Badge variant="success" size="medium">
          +{report.points} pts
        </Badge>
      </div>

      {/* Ratings */}
      {report.ratings && report.ratings.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          {report.ratings.map((item, idx) => {
            const display = getRatingDisplay(item.rating);
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: COLORS.background,
                  borderRadius: '8px',
                  marginBottom: '6px',
                }}
              >
                <div style={{ fontSize: '14px', color: COLORS.textPrimary }}>
                  {item.expectation}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{display.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: display.color }}>
                    {display.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback Message */}
      {report.feedback && (
        <div
          style={{
            padding: '12px',
            background: COLORS.background,
            borderRadius: '8px',
            fontSize: '14px',
            color: COLORS.textPrimary,
            fontStyle: 'italic',
          }}
        >
          💬 "{report.feedback}"
        </div>
      )}
    </div>
  );
}
