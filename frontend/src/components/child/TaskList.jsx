import TaskCard from './TaskCard';
import { COLORS } from '../../utils/constants';

/**
 * TaskList - List of tasks with filtering and stats
 * Preserves exact styling from original App.jsx
 * 
 * @param {Array} tasks - Array of task objects
 * @param {Function} onSubmitTask - Callback when a task is submitted
 * @param {boolean} readOnly - If true, disables all interactions
 */
export default function TaskList({ tasks, onSubmitTask, readOnly = false }) {
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'redo');
  const awaitingTasks = tasks.filter(t => t.status === 'awaiting');
  const approvedTasks = tasks.filter(t => t.status === 'approved');

  return (
    <div>
      {/* Stats Header */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '16px',
        padding: '12px',
        background: COLORS.background,
        borderRadius: '12px',
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.primary }}>
            {pendingTasks.length}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            To Do
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.highlight }}>
            {awaitingTasks.length}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Awaiting
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.primary }}>
            {approvedTasks.length}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.textSecondary }}>
            Approved
          </div>
        </div>
      </div>

      {/* Task Cards */}
      {tasks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: COLORS.textSecondary,
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>No tasks yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            {readOnly ? 'Tasks will appear here when added' : 'Ask your parent to add some tasks!'}
          </div>
        </div>
      ) : (
        <>
          {/* Pending/Redo Tasks */}
          {pendingTasks.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: COLORS.textSecondary,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                To Do
              </div>
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSubmit={onSubmitTask}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}

          {/* Awaiting Tasks */}
          {awaitingTasks.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: COLORS.textSecondary,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Awaiting Review
              </div>
              {awaitingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSubmit={onSubmitTask}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}

          {/* Approved Tasks */}
          {approvedTasks.length > 0 && (
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: COLORS.textSecondary,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Completed Today
              </div>
              {approvedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onSubmit={onSubmitTask}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
