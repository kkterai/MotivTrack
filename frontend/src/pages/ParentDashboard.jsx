import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { childProfileService } from '../services/childProfiles';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';
import TaskManagement from '../components/parent/TaskManagement';
import RewardManagement from '../components/parent/RewardManagement';

/**
 * ParentDashboard - Main dashboard for parent users
 * Matches the design from screenshots with tabs and management interfaces
 */
export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { rewards, fetchRewards, createReward, updateReward, deleteReward } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [activeTab, setActiveTab] = useState('verify'); // verify, inbox, school, tasks, rewards
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  // Load data on mount and check onboarding status
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        console.log('[ParentDashboard] Fetching child profiles for user:', user.id, 'role:', user.role);
        
        // Fetch child profiles for this parent
        const profilesResponse = await childProfileService.getMyChildProfiles();
        console.log('[ParentDashboard] Child profiles response:', profilesResponse);
        
        // The service already unwraps response.data, so profilesResponse is the array
        const profiles = profilesResponse || [];
        console.log('[ParentDashboard] Parsed profiles:', profiles, 'count:', profiles.length);
        
        // If admin parent has no child profiles, redirect to onboarding
        if (user.role === 'admin_parent' && profiles.length === 0) {
          console.log('[ParentDashboard] No child profiles found, redirecting to onboarding');
          navigate('/parent/onboarding', { replace: true });
          return;
        }
        
        console.log('[ParentDashboard] Child profiles found, loading dashboard');
        setChildProfiles(profiles);
        if (profiles.length > 0) {
          setSelectedChild(profiles[0].id);
        }
        
        // Fetch notifications
        await fetchNotifications();
      } catch (error) {
        console.error('[ParentDashboard] Error loading parent dashboard:', error);
        // If there's an error fetching profiles, assume no profiles and redirect
        if (user.role === 'admin_parent') {
          console.log('[ParentDashboard] Error occurred, redirecting admin parent to onboarding');
          navigate('/parent/onboarding', { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, fetchNotifications]);

  // Fetch tasks and rewards when selected child changes
  useEffect(() => {
    const loadChildData = async () => {
      if (!selectedChild) return;
      
      try {
        console.log('[ParentDashboard] Fetching tasks and rewards for child:', selectedChild);
        await Promise.all([
          fetchTasks(selectedChild),
          fetchRewards(selectedChild)
        ]);
        console.log('[ParentDashboard] Tasks and rewards loaded successfully');
      } catch (error) {
        console.error('[ParentDashboard] Error loading child data:', error);
      }
    };

    loadChildData();
  }, [selectedChild, fetchTasks, fetchRewards]);

  // Wrapper functions to inject selectedChild into task/reward operations
  const handleCreateTask = async (taskData) => {
    if (!selectedChild) {
      console.error('[ParentDashboard] No child selected');
      return;
    }
    return createTask({ ...taskData, childProfileId: selectedChild });
  };

  const handleUpdateTask = async (taskId, taskData) => {
    return updateTask(taskId, taskData);
  };

  const handleDeleteTask = async (taskId) => {
    // Note: deleteTask is not in the store, so we'll need to handle this differently
    console.warn('[ParentDashboard] Delete task not implemented yet');
  };

  const handleCreateReward = async (rewardData) => {
    if (!selectedChild) {
      console.error('[ParentDashboard] No child selected');
      return;
    }
    return createReward({ ...rewardData, childProfileId: selectedChild });
  };

  const handleUpdateReward = async (rewardId, rewardData) => {
    return updateReward(rewardId, rewardData);
  };

  const handleDeleteReward = async (rewardId) => {
    // Note: deleteReward is not in the store, so we'll need to handle this differently
    console.warn('[ParentDashboard] Delete reward not implemented yet');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: COLORS.background,
      }}>
        <div style={{ fontSize: '18px', color: COLORS.textSecondary }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.background }}>
      {/* Header */}
      <div style={{
        background: COLORS.gradient,
        padding: '20px',
        color: 'white',
      }}>
        <div style={{
          maxWidth: '1200px',
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
              👨‍👩‍👧
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>
                Parent Dashboard
              </h1>
              <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>
                {user?.name || 'Parent'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
              e.target.style.color = 'white';
            }}
          >
            Logout
          </button>
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
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px',
          padding: '0 20px',
        }}>
          {[
            { id: 'verify', label: '✓ Verify', icon: '✓' },
            { id: 'inbox', label: '📬 Inbox', icon: '📬' },
            { id: 'school', label: '🏫 School', icon: '🏫' },
            { id: 'tasks', label: '✏️ Tasks', icon: '✏️' },
            { id: 'rewards', label: '🎁 Rewards', icon: '🎁' },
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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {activeTab === 'verify' && <VerifyTab />}
        {activeTab === 'inbox' && <InboxTab />}
        {activeTab === 'school' && <SchoolTab />}
        {activeTab === 'tasks' && (
          <TaskManagement
            tasks={tasks}
            onAddTask={handleCreateTask}
            onEditTask={handleUpdateTask}
            onArchiveTask={handleDeleteTask}
          />
        )}
        {activeTab === 'rewards' && (
          <RewardManagement
            rewards={rewards}
            onAddReward={handleCreateReward}
            onEditReward={handleUpdateReward}
            onArchiveReward={handleDeleteReward}
          />
        )}
      </div>
    </div>
  );
}

// Verify Tab - Pending claims
function VerifyTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Pending Claims
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          No pending claims to verify
        </p>
      </div>
    </div>
  );
}

// Inbox Tab - Pending redemptions
function InboxTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Pending Deliveries
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📬</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          No pending reward deliveries
        </p>
      </div>
    </div>
  );
}

// School Tab - Teacher management
function SchoolTab() {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        School & Teachers
      </h2>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏫</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary }}>
          Teacher management coming soon
        </p>
      </div>
    </div>
  );
}

