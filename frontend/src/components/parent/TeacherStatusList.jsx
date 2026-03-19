import { Card, Badge } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * TeacherStatusList - Shows which teachers have submitted reports today
 * Available to both admin_parent and delivery_parent
 * 
 * @param {Array} teachers - Array of teacher objects
 * @param {Array} reportsToday - Array of report objects submitted today
 * @param {string} today - Today's date string
 */
export default function TeacherStatusList({ teachers, reportsToday = [], today }) {
  if (teachers.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👩‍🏫</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
            No teachers yet
          </div>
          <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
            Invite teachers to track school behavior
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: COLORS.textPrimary,
        marginBottom: '16px',
      }}>
        Teacher Reports Today
      </div>

      {teachers.map(teacher => {
        const hasReported = reportsToday.some(r => r.teacherId === teacher.id);
        
        return (
          <Card key={teacher.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: COLORS.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: '700',
                }}
              >
                {teacher.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', color: COLORS.textPrimary }}>
                  {teacher.name}
                </div>
                {teacher.subject && (
                  <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>
                    {teacher.subject}
                  </div>
                )}
              </div>
              {hasReported ? (
                <Badge variant="verified" size="small">
                  ✓ Submitted
                </Badge>
              ) : (
                <Badge variant="pending" size="small">
                  Pending
                </Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
