import { useState } from 'react';
import { TaskList, PointsDisplay, RewardList, TeacherReportCard } from '../components/child';
import { COLORS } from '../utils/constants';

/**
 * ChildDashboard - Main dashboard for child users
 * Preserves exact layout and functionality from original ChildView
 * 
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of task objects
 * @param {Function} props.onSubmitTask - Callback when task is submitted
 * @param {number} props.points - Current point balance
 * @param {number} props.goal - Goal points for next reward
 * @param {number} props.streak - Current streak count
 * @param {boolean} props.bonusAwarded - Whether welcome bonus was awarded
 * @param {Array} props.rewards - Array of reward objects
 * @param {Function} props.onRedeemReward - Callback when reward is redeemed
 * @param {Object} props.latestTeacherReport - Most recent teacher report (optional)
 * @param {boolean} props.readOnly - If true, disables all interactions (for parent view)
 */
export default function ChildDashboard({
  tasks = [],
  onSubmitTask,
  points = 0,
  goal = 20,
  streak = 0,
  bonusAwarded = false,
  rewards = [],
  onRedeemReward,
  latestTeacherReport = null,
  readOnly = false,
}) {
  const [tab, setTab] = useState('tasks');
  const [celebrate, setCelebrate] = useState(false);

  const handleRedeemReward = (reward) => {
    if (readOnly) return;
    onRedeemReward(reward);
    // Trigger celebration animation
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2000);
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: 440, 
      margin: '0 auto',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Celebration Animation */}
      {celebrate && (
        <div style={{ 
          position: 'fixed', 
          top: '38%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          fontSize: 40, 
          zIndex: 999, 
          pointerEvents: 'none',
        }}>
          🎉✨🌟🎊
        </div>
      )}

      {/* Points Display */}
      <PointsDisplay
        points={points}
        goal={goal}
        streak={streak}
        bonusAwarded={bonusAwarded}
      />

      {/* Latest Teacher Report (if exists and points were earned) */}
      {latestTeacherReport && latestTeacherReport.points > 0 && (
        <TeacherReportCard report={latestTeacherReport} />
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        background: COLORS.background,
        padding: '4px',
        borderRadius: '12px',
      }}>
        <button
          onClick={() => !readOnly && setTab('tasks')}
          style={{
            flex: 1,
            padding: '12px',
            background: tab === 'tasks' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            color: tab === 'tasks' ? COLORS.textPrimary : COLORS.textSecondary,
            cursor: readOnly ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'tasks' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          📋 Tasks
        </button>
        <button
          onClick={() => !readOnly && setTab('rewards')}
          style={{
            flex: 1,
            padding: '12px',
            background: tab === 'rewards' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            color: tab === 'rewards' ? COLORS.textPrimary : COLORS.textSecondary,
            cursor: readOnly ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: tab === 'rewards' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          🎁 Rewards
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'tasks' ? (
        <TaskList
          tasks={tasks}
          onSubmitTask={onSubmitTask}
          readOnly={readOnly}
        />
      ) : (
        <RewardList
          rewards={rewards}
          currentPoints={points}
          onRedeem={handleRedeemReward}
          readOnly={readOnly}
        />
      )}

      {/* Read-Only Notice */}
      {readOnly && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: COLORS.background,
          borderRadius: '12px',
          textAlign: 'center',
          fontSize: '13px',
          color: COLORS.textSecondary,
        }}>
          👀 You're viewing this as a parent (read-only)
        </div>
      )}
    </div>
  );
}
