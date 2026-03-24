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
import { Button } from '../components/ui/Button/Button';
import { Card } from '../components/ui/Card/Card';
import { Tabs } from '../components/ui/Tabs/Tabs';
import { EmptyState } from '../components/ui/EmptyState/EmptyState';
import { ChildDashboardHero } from '../components/patterns/ChildDashboardHero/ChildDashboardHero';
import { TaskCard } from '../components/patterns/TaskCard/TaskCard';
import { RewardCard } from '../components/patterns/RewardCard/RewardCard';
import './ChildDashboard.css';

/**
 * Child Dashboard - Main view for child users
 * Fully migrated to use design system components and tokens
 */
export default function ChildDashboard() {
  const { user, logout } = useAuthStore();
  const { balance: totalPoints, fetchBalance } = usePointStore();
  const { rewards, fetchRewards, redeemReward, loading: rewardsLoading } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('tasks');
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
    let currentInterval = 15000;
    const MAX_INTERVAL = 60000;
    const MIN_INTERVAL = 15000;
    let previousDataJson = '';
    
    const loadData = async () => {
      if (document.hidden) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const [claimsResponse, profileResponse, historyResponse, tasksResponse] = await Promise.all([
          claimService.getClaimsByChild(user.childProfileId),
          childProfileService.getChildProfile(user.childProfileId),
          pointService.getHistory(user.childProfileId, 100),
          taskService.getTasksForDate(user.childProfileId, today)
        ]);
        
        const claims = claimsResponse.data || [];
        setTaskClaims(claims);
        
        const tasks = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.data || []);
        setTodayTasks(tasks);
        
        setChildProfile(profileResponse);
        
        const welcomeBonusTransactions = historyResponse.filter(tx => tx.source === 'welcome_bonus');
        const sortedBonuses = welcomeBonusTransactions.sort((a, b) =>
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        if (sortedBonuses.length > 0) {
          const parentBonus = sortedBonuses[0].amount;
          setWelcomeBonusAmount(parentBonus);
        }
        
        fetchBalance(user.childProfileId);
        fetchRewards(user.childProfileId);
        fetchNotifications();
        
        const currentDataJson = JSON.stringify({ claims, tasks, balance: totalPoints });
        const dataChanged = currentDataJson !== previousDataJson;
        
        if (dataChanged) {
          previousDataJson = currentDataJson;
          
          if (currentInterval !== MIN_INTERVAL) {
            currentInterval = MIN_INTERVAL;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(loadData, currentInterval);
          }
        } else {
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
    
    loadData();
    pollInterval = setInterval(loadData, currentInterval);
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollInterval) clearInterval(pollInterval);
      } else {
        currentInterval = MIN_INTERVAL;
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(loadData, currentInterval);
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, fetchBalance, fetchRewards, fetchNotifications, totalPoints]);

  const handleDismissWelcomeBanner = () => {
    localStorage.setItem('welcomeBannerDismissed', 'true');
    setShowWelcomeBanner(false);
  };

  const handleTaskSubmit = async (taskId, quality) => {
    setSubmitting(true);
    try {
      const claimData = {
        taskId,
        childProfileId: user.childProfileId,
        claimType: quality,
      };
      await claimService.createClaim(claimData);
      
      await fetchNotifications();
      
      const today = new Date().toISOString().split('T')[0];
      const [claimsResponse, tasksResponse] = await Promise.all([
        claimService.getClaimsByChild(user.childProfileId),
        taskService.getTasksForDate(user.childProfileId, today)
      ]);
      
      setTaskClaims(claimsResponse.data || []);
      setTodayTasks(Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.data || []));
      
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
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  const tasksCompleted = todayTasks.filter(t => t.completedToday).length;
  const totalTasks = todayTasks.length;

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'school', label: 'School', icon: '🏫' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  return (
    <div className="child-dashboard app-shell--child">
      {/* Welcome Banner */}
      {showWelcomeBanner && childProfile && childProfile.adminParent && (
        <WelcomeBanner
          totalPoints={totalPoints}
          welcomeBonusAmount={welcomeBonusAmount}
          parentReference={childProfile.adminParent.parentReference || childProfile.adminParent.name || 'your parent'}
          onDismiss={handleDismissWelcomeBanner}
        />
      )}

      {/* Hero Section */}
      <ChildDashboardHero
        childName={user?.name || 'there'}
        childIcon="🦊"
        totalPoints={totalPoints}
        tasksCompleted={tasksCompleted}
        totalTasks={totalTasks}
        greeting="Keep crushing it today"
      />

      {/* Tab Navigation */}
      <div className="child-dashboard__tabs">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mode="child"
        />
      </div>

      {/* Content */}
      <div className="child-dashboard__content">
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
    return (
      <div className="child-dashboard__loading">
        Loading tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="📋"
        heading="No tasks yet"
        description="Ask your parent to add some tasks to get started!"
      />
    );
  }

  return (
    <div className="child-dashboard__task-list">
      {tasks.map(task => {
        const taskClaim = task.taskClaims?.[0] || null;
        
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

// Rewards Tab Component
function RewardsTab({ rewards, loading, totalPoints, onRedeem }) {
  if (loading) {
    return (
      <div className="child-dashboard__loading">
        Loading rewards...
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <EmptyState
        icon="🎁"
        heading="No rewards yet"
        description="Ask your parent to add some rewards you can earn!"
      />
    );
  }

  return (
    <div className="child-dashboard__reward-grid">
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

// School Tab Component
function SchoolTab({ notifications }) {
  const schoolNotifications = notifications.filter(n => n.type === 'teacher_report');

  if (schoolNotifications.length === 0) {
    return (
      <EmptyState
        icon="🏫"
        heading="No school reports yet"
        description="When your teachers submit today's report, it'll show up here."
      />
    );
  }

  return (
    <div className="child-dashboard__school-list">
      {schoolNotifications.map(notification => (
        <Card key={notification.id} className="child-dashboard__school-card">
          <div className="child-dashboard__school-header">
            <div className="child-dashboard__school-icon">👩‍🏫</div>
            <div>
              <h3 className="child-dashboard__school-title">
                {notification.title}
              </h3>
              <p className="child-dashboard__school-date">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="child-dashboard__school-message">
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
    <EmptyState
      icon="📜"
      heading="History Coming Soon"
      description="You'll be able to see your completed tasks and redeemed rewards here."
    />
  );
}

// Welcome Banner Component
function WelcomeBanner({ totalPoints, welcomeBonusAmount, parentReference, onDismiss }) {
  const parentBonus = welcomeBonusAmount;
  const motivTrackBonus = 3;
  
  const buildMessage = () => {
    if (totalPoints === 0) {
      return (
        <>
          <p>
            Welcome! You're starting with <strong>0 points</strong>, but don't worry — you'll earn points quickly!
          </p>
          <p>
            To earn points, tap <strong>"Done"</strong> on a task when you finish it. Your {parentReference} will confirm it, and your points will update.
          </p>
        </>
      );
    }
    
    if (parentBonus > 0) {
      return (
        <>
          <p>
            You already have <strong>{totalPoints} points</strong>! Your {parentReference} gave you <strong>{parentBonus} {parentBonus === 1 ? 'point' : 'points'}</strong> for the commitment it took to reach your dashboard, and we gave you <strong>{motivTrackBonus} points</strong> because we're just glad you're here.
          </p>
          <p>
            To earn more points, tap <strong>"Done"</strong> on a task when you finish it — your {parentReference} will confirm and your points will update.
          </p>
        </>
      );
    }
    
    return (
      <>
        <p>
          You already have <strong>{totalPoints} {totalPoints === 1 ? 'point' : 'points'}</strong>! We gave you {totalPoints === 1 ? 'this' : 'these'} because we're just glad you're here.
        </p>
        <p>
          To earn more points, tap <strong>"Done"</strong> on a task when you finish it — your {parentReference} will confirm and your points will update.
        </p>
      </>
    );
  };

  return (
    <div className="welcome-banner">
      <div className="welcome-banner__container">
        <button
          onClick={onDismiss}
          className="welcome-banner__dismiss"
          aria-label="Dismiss welcome banner"
        >
          ×
        </button>

        <div className="welcome-banner__content">
          <div className="welcome-banner__icon">🎉</div>
          
          <h2 className="welcome-banner__title">
            Welcome to MotivTrack!
          </h2>

          <div className="welcome-banner__message">
            {buildMessage()}
          </div>

          <Button
            variant="secondary"
            onClick={onDismiss}
            fullWidth
            className="welcome-banner__button"
          >
            Got it! Let's go 🚀
          </Button>
        </div>
      </div>
    </div>
  );
}
