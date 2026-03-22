import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { childProfileService } from '../services/childProfiles';
import { claimService } from '../services/claims';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';
import { PendingClaimsList, TaskManagement, RewardManagement } from '../components/parent';

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
  const [pendingClaims, setPendingClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Load data on mount and check onboarding status
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Fetch child profiles for this parent
        const profilesResponse = await childProfileService.getMyChildProfiles();
        
        // The service already unwraps response.data, so profilesResponse is the array
        const profiles = profilesResponse || [];
        
        // If admin parent has no child profiles, redirect to onboarding
        if (user.role === 'admin_parent' && profiles.length === 0) {
          navigate('/parent/onboarding', { replace: true });
          return;
        }
        
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
          navigate('/parent/onboarding', { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, fetchNotifications]);

  // Fetch pending claims when user loads and poll for updates (optimized)
  useEffect(() => {
    let pollInterval;
    let currentInterval = 10000; // Start with 10 seconds
    const MAX_INTERVAL = 30000; // Max 30 seconds
    const MIN_INTERVAL = 10000; // Min 10 seconds
    let previousClaimsJson = '';
    
    const loadPendingClaims = async () => {
      // Skip if user is interacting or tab is not visible
      if (!user?.id || isInteracting || document.hidden) return;
      
      try {
        const response = await claimService.getPendingClaims();
        const claims = Array.isArray(response) ? response : (response.data || []);
        
        // Compare with previous state
        const currentClaimsJson = JSON.stringify(claims);
        const claimsChanged = currentClaimsJson !== previousClaimsJson;
        
        if (claimsChanged) {
          previousClaimsJson = currentClaimsJson;
          setPendingClaims(claims);
          
          // Reset to minimum interval when changes detected
          if (currentInterval !== MIN_INTERVAL) {
            currentInterval = MIN_INTERVAL;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(loadPendingClaims, currentInterval);
          }
        } else {
          // Gradually increase interval when no changes (exponential backoff)
          const newInterval = Math.min(currentInterval * 1.5, MAX_INTERVAL);
          if (newInterval !== currentInterval) {
            currentInterval = newInterval;
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = setInterval(loadPendingClaims, currentInterval);
          }
        }
      } catch (error) {
        console.error('Error loading pending claims:', error);
      }
    };

    // Initial load
    if (!isInteracting && user?.id) {
      setClaimsLoading(true);
      loadPendingClaims().finally(() => setClaimsLoading(false));
    }
    
    // Start polling
    pollInterval = setInterval(loadPendingClaims, currentInterval);
    
    // Pause polling when tab is hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (pollInterval) clearInterval(pollInterval);
      } else {
        currentInterval = MIN_INTERVAL; // Reset to min when tab becomes visible
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = setInterval(loadPendingClaims, currentInterval);
        loadPendingClaims(); // Immediate check when tab becomes visible
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, childProfiles, isInteracting]);

  // Fetch tasks and rewards when selected child changes
  useEffect(() => {
    const loadChildData = async () => {
      if (!selectedChild) return;
      
      try {
        await Promise.all([
          fetchTasks(selectedChild),
          fetchRewards(selectedChild)
        ]);
      } catch (error) {
        console.error('[ParentDashboard] Error loading child data:', error);
      }
    };

    loadChildData();
  }, [selectedChild, fetchTasks, fetchRewards]);

  // Wrapper functions to inject selectedChild into task/reward operations
  const handleCreateTask = async (taskData) => {
    if (!selectedChild) return;
    return createTask({ ...taskData, childProfileId: selectedChild });
  };

  const handleUpdateTask = async (taskId, taskData) => {
    return updateTask(taskId, taskData);
  };

  const handleDeleteTask = async (taskId) => {
    // Note: deleteTask is not in the store, so we'll need to handle this differently
    console.warn('Delete task not implemented yet');
  };

  const handleCreateReward = async (rewardData) => {
    if (!selectedChild) return;
    return createReward({ ...rewardData, childProfileId: selectedChild });
  };

  const handleUpdateReward = async (rewardId, rewardData) => {
    return updateReward(rewardId, rewardData);
  };

  const handleDeleteReward = async (rewardId) => {
    // Note: deleteReward is not in the store, so we'll need to handle this differently
    console.warn('Delete reward not implemented yet');
  };

  const handleVerifyClaim = async (claimId, verificationData) => {
    try {
      await claimService.verifyClaim(claimId, verificationData);
      
      // Refresh pending claims
      const response = await claimService.getPendingClaims();
      const claims = Array.isArray(response) ? response : (response.data || []);
      setPendingClaims(claims);
      
      // Refresh tasks and notifications
      if (selectedChild) {
        await fetchTasks(selectedChild);
      }
      await fetchNotifications();
    } catch (error) {
      console.error('Error verifying claim:', error);
      alert('Failed to verify claim. Please try again.');
    }
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
        {activeTab === 'verify' && (
          <PendingClaimsList
            claims={pendingClaims}
            onVerify={handleVerifyClaim}
            loading={claimsLoading}
            onInteractionStart={() => setIsInteracting(true)}
            onInteractionEnd={() => setIsInteracting(false)}
          />
        )}
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

