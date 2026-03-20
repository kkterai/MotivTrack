import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { usePointStore } from '../stores/usePointStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { COLORS } from '../utils/constants';
import { Button, Card } from '../components/common';

/**
 * Child Dashboard - Main view for child users
 * Matches the design from screenshots with tabs, task cards, and reward cards
 */
export default function ChildDashboard() {
  const { user, logout } = useAuthStore();
  const { tasks, fetchTasks, loading: tasksLoading } = useTaskStore();
  const { totalPoints, fetchTotalPoints } = usePointStore();
  const { rewards, fetchRewards, redeemReward, loading: rewardsLoading } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, rewards, school, history
  const [expandedTask, setExpandedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    console.log('[ChildDashboard] User:', user);
    console.log('[ChildDashboard] childProfileId:', user?.childProfileId);
    
    if (user?.childProfileId) {
      console.log('[ChildDashboard] Fetching data for childProfileId:', user.childProfileId);
      fetchTasks(user.childProfileId);
      fetchTotalPoints(user.childProfileId);
      fetchRewards(user.childProfileId);
      fetchNotifications(user.id);
    } else {
      console.error('[ChildDashboard] No childProfileId found on user object!');
    }
  }, [user]);

  const handleTaskSubmit = async (taskId, quality) => {
    setSubmitting(true);
    try {
      // Submit task claim
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({
          taskId,
          claimType: quality,
        }),
      });
      
      // Refresh data
      await Promise.all([
        fetchTasks(user.childProfileId),
        fetchNotifications(user.id),
      ]);
      
      setExpandedTask(null);
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemReward = async (rewardId) => {
    if (!confirm('Are you sure you want to redeem this reward?')) return;
    
    try {
      await redeemReward(rewardId, user.childProfileId);
      await Promise.all([
        fetchTotalPoints(user.childProfileId),
        fetchRewards(user.childProfileId),
        fetchNotifications(user.id),
      ]);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const tasksCompleted = tasks.filter(t => t.completedToday).length;
  const totalTasks = tasks.length;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      {/* Header */}
      <div style={{
        background: COLORS.gradient,
        padding: '20px',
        color: 'white',
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}>
              🦊
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Hey, {user?.name || 'there'}!
              </h1>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
                Keep crushing it today
              </p>
            </div>
          </div>
          <div style={{
            background: '#F6BB18',
            color: '#1a1a1a',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '20px',
          }}>
            {totalPoints || 0} <span style={{ fontSize: '14px', fontWeight: '600' }}>PTS</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '16px auto 0',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>TASKS DONE</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{tasksCompleted} / {totalTasks}</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'white',
              height: '100%',
              width: `${totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: 'white',
        borderBottom: `2px solid ${COLORS.borderLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '0 20px',
        }}>
          {[
            { id: 'tasks', label: '📋 Tasks', icon: '📋' },
            { id: 'rewards', label: '🎁 Rewards', icon: '🎁' },
            { id: 'school', label: '🏫 School', icon: '🏫' },
            { id: 'history', label: '📜 History', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '16px 8px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${COLORS.primary}` : '3px solid transparent',
                color: activeTab === tab.id ? COLORS.primary : COLORS.textSecondary,
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            loading={tasksLoading}
            expandedTask={expandedTask}
            setExpandedTask={setExpandedTask}
            onSubmit={handleTaskSubmit}
            submitting={submitting}
          />
        )}

        {activeTab === 'rewards' && (
          <RewardsTab
            rewards={rewards}
            loading={rewardsLoading}
            totalPoints={totalPoints}
            onRedeem={handleRedeemReward}
          />
        )}

        {activeTab === 'school' && (
          <SchoolTab notifications={notifications} />
        )}

        {activeTab === 'history' && (
          <HistoryTab userId={user?.id} />
        )}
      </div>
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ tasks, loading, expandedTask, setExpandedTask, onSubmit, submitting }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textSecondary }}>Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ color: COLORS.textSecondary }}>No tasks yet. Ask your parent to add some!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isExpanded={expandedTask === task.id}
          onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      ))}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, isExpanded, onToggle, onSubmit, submitting }) {
  const tips = Array.isArray(task.tips) ? task.tips : (task.tips ? [task.tips] : []);
  
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {/* Task Header */}
      <div
        onClick={onToggle}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          background: isExpanded ? COLORS.backgroundLight : 'white',
        }}
      >
        <div style={{ fontSize: '32px' }}>{task.icon || '📋'}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
            {task.title}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: COLORS.textSecondary }}>
            {task.doneStandard?.substring(0, 60)}{task.doneStandard?.length > 60 ? '...' : ''}
          </p>
        </div>
        <div style={{
          background: COLORS.primary,
          color: 'white',
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          +{task.pointsDone}pt {task.pointsExtraWellDone > 0 && `▲`}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '0 16px 16px', background: COLORS.backgroundLight }}>
          {/* Tips */}
          {tips.length > 0 && (
            <div style={{
              background: '#FEF3C7',
              border: `2px solid ${COLORS.accent}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
            }}>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '8px', color: COLORS.textPrimary }}>
                💡 TIPS
              </div>
              {tips.map((tip, idx) => (
                <div key={idx} style={{
                  fontSize: '14px',
                  color: COLORS.textPrimary,
                  marginBottom: idx < tips.length - 1 ? '4px' : 0,
                  paddingLeft: '8px',
                  borderLeft: `3px solid ${COLORS.accent}`,
                }}>
                  {tip}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onSubmit(task.id, 'done')}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '16px',
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              ✓ Done<br />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>+{task.pointsDone} pts</span>
            </button>

            {task.pointsExtraWellDone > 0 && (
              <button
                onClick={() => onSubmit(task.id, 'extra_well_done')}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'white',
                  color: COLORS.primary,
                  border: `2px solid ${COLORS.primary}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                ⭐ Extra Well Done<br />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>+{task.pointsDone + task.pointsExtraWellDone} pts</span>
              </button>
            )}
          </div>

          {/* Standards */}
          <div style={{ marginTop: '16px', fontSize: '12px', color: COLORS.textSecondary }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>✓ Done means...</strong><br />
              {task.doneStandard}
            </div>
            {task.extraWellDoneStandard && (
              <div>
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

// Rewards Tab Component
function RewardsTab({ rewards, loading, totalPoints, onRedeem }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textSecondary }}>Loading rewards...</div>;
  }

  if (rewards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
        <p style={{ color: COLORS.textSecondary }}>No rewards yet. Ask your parent to add some!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
      {rewards.map(reward => (
        <RewardCard
          key={reward.id}
          reward={reward}
          totalPoints={totalPoints}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  );
}

// Reward Card Component
function RewardCard({ reward, totalPoints, onRedeem }) {
  const canAfford = totalPoints >= reward.pointsCost;
  const pointsNeeded = reward.pointsCost - totalPoints;

  return (
    <Card style={{
      padding: '16px',
      textAlign: 'center',
      border: canAfford ? `3px solid ${COLORS.accent}` : `2px solid ${COLORS.borderLight}`,
      background: canAfford ? '#FFFBEB' : 'white',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>{reward.icon || '🎁'}</div>
      <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
        {reward.title}
      </h3>
      {reward.category && (
        <div style={{ fontSize: '11px', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: '8px' }}>
          {reward.category}
        </div>
      )}
      <div style={{
        fontSize: '18px',
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: '12px',
      }}>
        {reward.pointsCost} pts
      </div>

      {canAfford ? (
        <>
          {reward.needsScheduling && (
            <div style={{
              fontSize: '11px',
              color: COLORS.textSecondary,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}>
              🗓️ Needs scheduling
            </div>
          )}
          <button
            onClick={() => onRedeem(reward.id)}
            style={{
              width: '100%',
              padding: '10px',
              background: COLORS.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Redeem
          </button>
        </>
      ) : (
        <div style={{
          padding: '10px',
          background: COLORS.backgroundLight,
          borderRadius: '8px',
          fontSize: '12px',
          color: COLORS.textSecondary,
        }}>
          Need {pointsNeeded} more
        </div>
      )}

      {reward.shoppingLink && (
        <a
          href={reward.shoppingLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            marginTop: '8px',
            fontSize: '11px',
            color: COLORS.primary,
            textDecoration: 'none',
          }}
        >
          🔗 Browse online
        </a>
      )}
    </Card>
  );
}

// School Tab Component
function SchoolTab({ notifications }) {
  const schoolNotifications = notifications.filter(n => n.type === 'teacher_report');

  if (schoolNotifications.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPrimary, marginBottom: '8px' }}>
          No school reports yet.
        </h3>
        <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
          When your teachers submit today's report, it'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {schoolNotifications.map(notification => (
        <Card key={notification.id} style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '32px' }}>👩‍🏫</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                {notification.title}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: COLORS.textSecondary }}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: COLORS.textPrimary }}>
            {notification.message}
          </p>
        </Card>
      ))}
    </div>
  );
}

// History Tab Component
function HistoryTab({ userId }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📜</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.textPrimary, marginBottom: '8px' }}>
        History Coming Soon
      </h3>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary }}>
        You'll be able to see your completed tasks and redeemed rewards here.
      </p>
    </div>
  );
}
