import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { usePointStore } from '../stores/usePointStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { childProfileService } from '../services/childProfiles';
import { pointService } from '../services/points';
import { claimService } from '../services/claims';
import { taskService } from '../services/tasks';
import { COLORS } from '../utils/constants';
import { Button, Card } from '../components/common';

/**
 * Child Dashboard - Main view for child users
 * Matches the design from screenshots with tabs, task cards, and reward cards
 */
export default function ChildDashboard() {
  const { user, logout } = useAuthStore();
  const { balance: totalPoints, fetchBalance } = usePointStore();
  const { rewards, fetchRewards, redeemReward, loading: rewardsLoading } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('tasks'); // tasks, rewards
  const [expandedTask, setExpandedTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [childProfile, setChildProfile] = useState(null);
  const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(0);
  const [taskClaims, setTaskClaims] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Check if welcome banner should be shown
  useEffect(() => {
    const bannerDismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!bannerDismissed && user?.childProfileId) {
      setShowWelcomeBanner(true);
    }
  }, [user]);

  // Load data on mount and poll for updates (optimized)
  useEffect(() => {
    if (!user?.childProfileId) return;
    
    let pollInterval;
    let currentInterval = 15000; // Start with 15 seconds
    const MAX_INTERVAL = 60000; // Max 60 seconds
    const MIN_INTERVAL = 15000; // Min 15 seconds
    let previousDataJson = '';
    
    const loadData = async () => {
      // Skip if tab is not visible
      if (document.hidden) return;
      
      try {
        // Fetch all data in parallel
        const [claimsResponse, profileResponse, historyResponse] = await Promise.all([
          claimService.getClaimsByChild(user.childProfileId),
          childProfileService.getChildProfile(user.childProfileId),
          pointService.getHistory(user.childProfileId, 100)
        ]);
        
        // Update claims
        const claims = claimsResponse.data || [];
        setTaskClaims(claims);
        
        // Update profile
        setChildProfile(profileResponse);
        
        // Update welcome bonus - get the parent's welcome bonus (oldest transaction)
        const welcomeBonusTransactions = historyResponse.filter(tx => tx.source === 'welcome_bonus');
        
        // Sort by createdAt ascending (oldest first) - first one is from parent during onboarding
        const sortedBonuses = welcomeBonusTransactions.sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        if (sortedBonuses.length > 0) {
          // First bonus (oldest) is from parent, rest are from MotivTrack
          const parentBonus = sortedBonuses[0].amount;
          setWelcomeBonusAmount(parentBonus);
        }
        
        // Fetch balance, rewards, notifications
        fetchBalance(user.childProfileId);
        fetchRewards(user.childProfileId);
        fetchNotifications();
        
        // Check if data changed
        const currentDataJson = JSON.stringify({ claims, balance: totalPoints });
        const dataChanged = currentDataJson !== previousDataJson;
        
        if (dataChanged) {
          previousDataJson = currentDataJson;
          
          // Reset to minimum interval when changes detected
          if (currentInterval !== MIN_INTERVAL) {
            currentInterval = MIN_INTERVAL;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(loadData, currentInterval);
          }
        } else {
          // Gradually increase interval when no changes (exponential backoff)
          const newInterval = Math.min(currentInterval * 1.5, MAX_INTERVAL);
          if (newInterval !== currentInterval) {
            currentInterval = newInterval;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(loadData, currentInterval);
          }
        }
      } catch (error) {
        console.error('Error loading child dashboard data:', error);
      }
    };
    
    // Load data immediately
    loadData();
    
    // Start polling
    pollInterval = setInterval(loadData, currentInterval);
    
    // Pause polling when tab is hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollInterval) clearInterval(pollInterval);
      } else {
        currentInterval = MIN_INTERVAL; // Reset to min when tab becomes visible
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(loadData, currentInterval);
        loadData(); // Immediate check when tab becomes visible
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchBalance, fetchRewards, fetchNotifications, totalPoints]);

  // Function to fetch today's tasks
  const fetchTodayTasks = async () => {
    if (!user?.childProfileId) return;
    
    try {
      setTasksLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await taskService.getTasksForDate(user.childProfileId, today);
      setTodayTasks(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      setTodayTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  // Fetch today's tasks on mount and when user changes
  useEffect(() => {
    if (user?.childProfileId) {
      fetchTodayTasks();
    }
  }, [user?.childProfileId]);

  const handleDismissWelcomeBanner = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setShowWelcomeBanner(false);
  };

  const handleTaskSubmit = async (taskId, quality) => {
    setSubmitting(true);
    console.log('handleTaskSubmit called with:', { taskId, quality, user });
    try {
      // Submit task claim
      const claimData = {
        taskId,
        childProfileId: user.childProfileId,
        claimType: quality,
      };
      console.log('Submitting claim with data:', claimData);
      await claimService.createClaim(claimData);
      
      // Refresh data
      await Promise.all([
        fetchTodayTasks(),
        fetchNotifications(), // No userId needed
      ]);
      
      // Refresh claims
      const claimsResponse = await claimService.getClaimsByChild(user.childProfileId);
      setTaskClaims(claimsResponse.data || []);
      
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
        fetchBalance(user.childProfileId),
        fetchRewards(user.childProfileId),
        fetchNotifications(), // No userId needed
      ]);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const tasksCompleted = todayTasks.filter(t => t.completedToday).length;
  const totalTasks = todayTasks.length;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      {/* Welcome Banner - only show when profile is loaded */}
      {showWelcomeBanner && childProfile && childProfile.adminParent && (
        <WelcomeBanner
          totalPoints={totalPoints}
          welcomeBonusAmount={welcomeBonusAmount}
          parentReference={childProfile.adminParent.parentReference || childProfile.adminParent.name || 'your parent'}
          onDismiss={handleDismissWelcomeBanner}
        />
      )}

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
            tasks={todayTasks}
            taskClaims={taskClaims}
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
function TasksTab({ tasks, taskClaims, loading, expandedTask, setExpandedTask, onSubmit, submitting }) {
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
      {tasks.map(task => {
        // Find the most recent claim for this task
        const taskClaim = taskClaims
          .filter(claim => claim.taskId === task.id)
          .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))[0];
        
        return (
          <TaskCard
            key={task.id}
            task={task}
            claim={taskClaim}
            isExpanded={expandedTask === task.id}
            onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
            onSubmit={onSubmit}
            submitting={submitting}
          />
        );
      })}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, claim, isExpanded, onToggle, onSubmit, submitting }) {
  const tips = Array.isArray(task.tips) ? task.tips : (task.tips ? [task.tips] : []);
  
  // Determine task status based on claim
  const hasPendingClaim = claim && claim.status === 'pending';
  const isVerified = claim && claim.status === 'verified';
  const needsRedo = claim && claim.status === 'redo_requested';
  
  // Check if task was auto-completed by a sibling (shared task with completedAt but no claim)
  const isAutoCompleted = task.taskType === 'SHARED' &&
                          task.taskAssignments?.[0]?.completedAt &&
                          !claim;
  
  return (
    <Card style={{
      padding: 0,
      overflow: 'hidden',
      borderLeft: needsRedo ? '4px solid #E74C3C' : hasPendingClaim ? `4px solid ${COLORS.accent}` : (isVerified || isAutoCompleted) ? `4px solid ${COLORS.primary}` : 'none',
      background: needsRedo ? '#FFEBEE' : (isVerified || isAutoCompleted) ? '#F0FDF9' : 'white',
    }}>
      {/* Task Header */}
      <div
        onClick={!hasPendingClaim && !isVerified && !isAutoCompleted ? onToggle : undefined}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: (!hasPendingClaim && !isVerified && !isAutoCompleted) ? 'pointer' : 'default',
          background: isExpanded ? COLORS.backgroundLight : (needsRedo ? '#FFEBEE' : (isVerified || isAutoCompleted) ? '#F0FDF9' : 'white'),
        }}
      >
        <div style={{ fontSize: '32px' }}>{task.icon || '📋'}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
            {task.title}
            {task.taskType === 'SHARED' && !isAutoCompleted && (
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
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: COLORS.textSecondary }}>
            {task.doneStandard?.substring(0, 60)}{task.doneStandard?.length > 60 ? '...' : ''}
          </p>
        </div>
        
        {/* Status Badge */}
        {hasPendingClaim && (
          <div style={{
            background: COLORS.accent,
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            ⏳ Pending Review
          </div>
        )}
        {isAutoCompleted && (
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            👥 Done by Sibling!
          </div>
        )}
        {isVerified && !isAutoCompleted && (
          <div style={{
            background: COLORS.primary,
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            ✓ Approved!
          </div>
        )}
        {needsRedo && (
          <div style={{
            background: '#E74C3C',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
          }}>
            🔄 Try Again
          </div>
        )}
        {!hasPendingClaim && !isVerified && !needsRedo && !isAutoCompleted && (
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
        )}
      </div>

      {/* Redo Note */}
      {needsRedo && claim.redoNote && (
        <div style={{
          padding: '12px 16px',
          background: '#FFCDD2',
          borderTop: '1px solid #E74C3C',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#C0392B', marginBottom: '4px' }}>
            Parent's Note:
          </div>
          <div style={{ fontSize: '14px', color: '#C0392B' }}>
            {claim.redoNote}
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && !hasPendingClaim && !isVerified && !isAutoCompleted && (
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

// Welcome Banner Component
function WelcomeBanner({ totalPoints, welcomeBonusAmount, parentReference, onDismiss }) {
  // The welcome bonus is what the parent gave
  const parentBonus = welcomeBonusAmount;
  const motivTrackBonus = 3; // MotivTrack always gives 3 points
  
  // Build the message dynamically based on what points they have
  const buildMessage = () => {
    if (totalPoints === 0) {
      return (
        <>
          <p style={{ margin: '0 0 12px 0' }}>
            Welcome! You're starting with <strong>0 points</strong>, but don't worry — you'll earn points quickly!
          </p>
          <p style={{ margin: '0' }}>
            To earn points, tap <strong>"Done"</strong> on a task when you finish it. Your {parentReference} will confirm it, and your points will update.
          </p>
        </>
      );
    }
    
    if (parentBonus > 0) {
      return (
        <>
          <p style={{ margin: '0 0 12px 0' }}>
            You already have <strong>{totalPoints} points</strong>! Your {parentReference} gave you <strong>{parentBonus} {parentBonus === 1 ? 'point' : 'points'}</strong> for the commitment it took to reach your dashboard, and we gave you <strong>{motivTrackBonus} points</strong> because we're just glad you're here.
          </p>
          <p style={{ margin: '0' }}>
            To earn more points, tap <strong>"Done"</strong> on a task when you finish it — your {parentReference} will confirm and your points will update.
          </p>
        </>
      );
    }
    
    // Parent gave 0, but child has points from MotivTrack
    return (
      <>
        <p style={{ margin: '0 0 12px 0' }}>
          You already have <strong>{totalPoints} {totalPoints === 1 ? 'point' : 'points'}</strong>! We gave you {totalPoints === 1 ? 'this' : 'these'} because we're just glad you're here.
        </p>
        <p style={{ margin: '0' }}>
          To earn more points, tap <strong>"Done"</strong> on a task when you finish it — your {parentReference} will confirm and your points will update.
        </p>
      </>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Dismiss Button */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'rgba(255, 255, 255, 0.3)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'white',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.5)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
        >
          ×
        </button>

        {/* Banner Content */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
        }}>
          <div style={{
            fontSize: '48px',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            🎉
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '16px',
            margin: '0 0 16px 0',
          }}>
            Welcome to MotivTrack!
          </h2>

          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            {buildMessage()}
          </div>

          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '14px',
              background: 'white',
              color: COLORS.primary,
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Got it! Let's go 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
