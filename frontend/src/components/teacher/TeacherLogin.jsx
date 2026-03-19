import { Button, Card } from '../common';
import { COLORS } from '../../utils/constants';

/**
 * TeacherLogin - Teacher selection screen
 * Preserves exact styling from original TeacherLoginView
 * 
 * @param {Array} teachers - Array of teacher objects
 * @param {Function} onLogin - Callback when teacher is selected
 * @param {Array} teachersPendingToday - Array of teacher IDs who haven't submitted today
 */
export default function TeacherLogin({ teachers, onLogin, teachersPendingToday = [] }) {
  return (
    <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>👩‍🏫</div>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: COLORS.textPrimary,
          marginBottom: '8px',
        }}>
          Teacher Portal
        </h1>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          Select your name to submit today's behavior report
        </p>
      </div>

      {/* Teacher List */}
      {teachers.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
              No teachers registered
            </div>
            <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '4px' }}>
              Parents need to invite teachers first
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {teachers.map(teacher => {
            const hasPending = teachersPendingToday.includes(teacher.id);
            
            return (
              <Card
                key={teacher.id}
                hoverable
                onClick={() => onLogin(teacher)}
                style={{
                  cursor: 'pointer',
                  border: hasPending ? `2px solid ${COLORS.highlight}` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: COLORS.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: 'white',
                      fontWeight: '700',
                    }}
                  >
                    {teacher.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: COLORS.textPrimary,
                      marginBottom: '2px',
                    }}>
                      {teacher.name}
                    </div>
                    {teacher.subject && (
                      <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                        {teacher.subject}
                      </div>
                    )}
                  </div>
                  {hasPending && (
                    <div
                      style={{
                        background: COLORS.highlight,
                        color: COLORS.textPrimary,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      Pending
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: COLORS.background,
          borderRadius: '12px',
          fontSize: '14px',
          color: COLORS.textSecondary,
          textAlign: 'center',
        }}
      >
        💡 Submit one report per student per day
      </div>
    </div>
  );
}
