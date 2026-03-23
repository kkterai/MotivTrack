import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { childProfileService } from '../services/childProfiles';
import { claimService } from '../services/claims';
import { assignmentService } from '../services/assignments';
import { rewardService } from '../services/rewards';
import { COLORS } from '../utils/constants';
import { Button, Card, Input } from '../components/common';
import { PendingClaimsList, PendingRedemptionsList, TaskManagement, RewardManagement, AssignmentPicker } from '../components/parent';

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
  
  const [activeTab, setActiveTab] = useState('review'); // review, tasks, rewards, child preview tabs
  const [childPreviewTab, setChildPreviewTab] = useState('today'); // today, tomorrow
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

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

  // Fetch pending redemptions
  useEffect(() => {
    const loadPendingRedemptions = async () => {
      if (!user?.id) return;
      
      try {
        const response = await rewardService.getPendingRedemptions();
        const redemptions = Array.isArray(response) ? response : (response.data || []);
        setPendingRedemptions(redemptions);
      } catch (error) {
        console.error('Error loading pending redemptions:', error);
      }
    };

    loadPendingRedemptions();
  }, [user]);

  // Load assignments for selected child
  const loadAssignments = useCallback(async () => {
    if (!selectedChild) return;
    
    try {
      const assignments = await assignmentService.getChildAssignments(selectedChild);
      setAssignments(Array.isArray(assignments) ? assignments : []);
    } catch (error) {
      console.error('[ParentDashboard] Error loading assignments:', error);
      setAssignments([]);
    }
  }, [selectedChild]);

  // Fetch tasks, rewards, and assignments when selected child changes
  useEffect(() => {
    const loadChildData = async () => {
      if (!selectedChild) return;
      
      try {
        setAssignmentsLoading(true);
        await Promise.all([
          fetchTasks(selectedChild),
          fetchRewards(selectedChild),
          loadAssignments()
        ]);
      } catch (error) {
        console.error('[ParentDashboard] Error loading child data:', error);
      } finally {
        setAssignmentsLoading(false);
      }
    };

    loadChildData();
  }, [selectedChild, fetchTasks, fetchRewards, loadAssignments]);

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

  const handleAssignTask = async (taskId, date) => {
    if (!selectedChild) return;
    
    try {
      const dateStr = date === 'today'
        ? assignmentService.getTodayISO()
        : assignmentService.getTomorrowISO();
      
      await assignmentService.assignTask(taskId, selectedChild, dateStr);
      
      // Refresh assignments
      await loadAssignments();
      
      alert(`Task assigned to ${date}!`);
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Failed to assign task. It may already be assigned for this date.');
    }
  };

  const handleDeliverReward = async (redemptionId) => {
    try {
      await rewardService.markRewardDelivered(redemptionId);
      
      // Refresh pending redemptions
      const response = await rewardService.getPendingRedemptions();
      const redemptions = Array.isArray(response) ? response : (response.data || []);
      setPendingRedemptions(redemptions);
      
      alert('Reward marked as delivered!');
    } catch (error) {
      console.error('Error delivering reward:', error);
      alert('Failed to mark reward as delivered.');
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
            { id: 'review', label: '📋 Review', icon: '📋' },
            { id: 'tasks', label: '✏️ Tasks', icon: '✏️' },
            { id: 'rewards', label: '🎁 Rewards', icon: '🎁' },
            ...childProfiles.map((child, index) => ({
              id: `child-${child.id}`,
              label: `👤 ${child.name}`,
              icon: '👤',
            })),
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
        {activeTab === 'review' && (
          <ReviewTab
            claims={pendingClaims}
            redemptions={pendingRedemptions}
            onVerify={handleVerifyClaim}
            onDeliver={handleDeliverReward}
            loading={claimsLoading}
            onInteractionStart={() => setIsInteracting(true)}
            onInteractionEnd={() => setIsInteracting(false)}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            assignments={assignments}
            selectedChild={childProfiles.find(c => c.id === selectedChild)}
            onAddTask={handleCreateTask}
            onEditTask={handleUpdateTask}
            onArchiveTask={handleDeleteTask}
            onAssignTask={handleAssignTask}
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
        {activeTab.startsWith('child-') && (
          <ChildPreviewTab
            childId={activeTab.replace('child-', '')}
            childName={childProfiles.find(c => c.id === activeTab.replace('child-', ''))?.name}
            assignments={assignments}
            previewTab={childPreviewTab}
            onPreviewTabChange={setChildPreviewTab}
          />
        )}
      </div>
    </div>
  );
}

// Review Tab - Consolidated Verify + Inbox
function ReviewTab({ claims, redemptions, onVerify, onDeliver, loading, onInteractionStart, onInteractionEnd }) {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Review - Action Items
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Verify completed tasks and deliver rewards
      </p>

      {/* Pending Claims Section */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: COLORS.textPrimary }}>
          ✓ Tasks to Verify
        </h3>
        <PendingClaimsList
          claims={claims}
          onVerify={onVerify}
          loading={loading}
          onInteractionStart={onInteractionStart}
          onInteractionEnd={onInteractionEnd}
        />
      </div>

      {/* Pending Redemptions Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: COLORS.textPrimary }}>
          📬 Rewards to Deliver
        </h3>
        <PendingRedemptionsList
          redemptions={redemptions}
          onDeliver={onDeliver}
        />
      </div>
    </div>
  );
}

// Tasks Tab - Task management with assignment
function TasksTab({ tasks, assignments, selectedChild, onAddTask, onEditTask, onArchiveTask, onAssignTask }) {
  // Get child icon - default to 🦊 if not set
  const childIcon = selectedChild?.icon || '🦊';
  const childName = selectedChild?.name || 'Child';
  
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
        Task Management
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '8px' }}>
        Assign tasks to {childName} for today or tomorrow. Edit or add tasks here.
      </p>

      {/* Task Management Component */}
      <TaskManagement
        tasks={tasks}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onArchiveTask={onArchiveTask}
      />

      {/* Assignment Section */}
      {tasks.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: COLORS.textPrimary }}>
            Assign Tasks
          </h3>
          <div style={{
            padding: '12px 16px',
            backgroundColor: COLORS.primaryLight,
            borderRadius: '8px',
            marginBottom: '16px',
            border: `2px solid ${COLORS.primary}`,
          }}>
            <p style={{ fontSize: '14px', color: COLORS.primary, fontWeight: '600', margin: 0 }}>
              {childIcon} Assigning to {childName}
            </p>
          </div>
          {tasks.map(task => (
            <AssignmentPicker
              key={task.id}
              task={task}
              onAssign={(date) => onAssignTask(task.id, date)}
              existingAssignments={assignments.filter(a => a.taskId === task.id)}
              childIcon={childIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Child Preview Tab - Shows what child will see
function ChildPreviewTab({ childId, childName, assignments, previewTab, onPreviewTabChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Filter assignments for this specific child
  const childAssignments = assignments.filter(a => a.childProfileId === childId);

  const todayAssignments = childAssignments.filter(a => {
    const assignedDate = new Date(a.assignedFor);
    assignedDate.setHours(0, 0, 0, 0);
    return assignedDate.getTime() === today.getTime();
  });

  const tomorrowAssignments = childAssignments.filter(a => {
    const assignedDate = new Date(a.assignedFor);
    assignedDate.setHours(0, 0, 0, 0);
    return assignedDate.getTime() === tomorrow.getTime();
  });

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: COLORS.textPrimary }}>
        {childName}'s View
      </h2>
      <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '24px' }}>
        Preview what {childName} will see in their dashboard
      </p>

      {/* Sub-tabs for Today/Tomorrow */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: `2px solid ${COLORS.borderLight}`,
      }}>
        <button
          onClick={() => onPreviewTabChange('today')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: previewTab === 'today' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
            color: previewTab === 'today' ? COLORS.primary : COLORS.textSecondary,
            fontWeight: previewTab === 'today' ? '700' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Today ({todayAssignments.length})
        </button>
        <button
          onClick={() => onPreviewTabChange('tomorrow')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: previewTab === 'tomorrow' ? `3px solid ${COLORS.primary}` : '3px solid transparent',
            color: previewTab === 'tomorrow' ? COLORS.primary : COLORS.textSecondary,
            fontWeight: previewTab === 'tomorrow' ? '700' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Tomorrow ({tomorrowAssignments.length})
        </button>
      </div>

      {/* Task List */}
      {previewTab === 'today' && (
        <div>
          {todayAssignments.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
                  No tasks assigned for today
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '8px' }}>
                  Go to the Tasks tab to assign tasks
                </div>
              </div>
            </Card>
          ) : (
            todayAssignments.map(assignment => (
              <Card key={assignment.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{assignment.task.icon || '📝'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                      {assignment.task.title}
                    </div>
                    <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                      ✅ {assignment.task.pointsDone} pts • ⭐ {assignment.task.pointsExtraWellDone} pts
                    </div>
                  </div>
                  {assignment.completedAt && (
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      backgroundColor: COLORS.successLight,
                      color: COLORS.success,
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      ✓ Completed
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {previewTab === 'tomorrow' && (
        <div>
          {tomorrowAssignments.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.textPrimary }}>
                  No tasks assigned for tomorrow
                </div>
                <div style={{ fontSize: '14px', color: COLORS.textSecondary, marginTop: '8px' }}>
                  Go to the Tasks tab to assign tasks
                </div>
              </div>
            </Card>
          ) : (
            tomorrowAssignments.map(assignment => (
              <Card key={assignment.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{assignment.task.icon || '📝'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.textPrimary }}>
                      {assignment.task.title}
                    </div>
                    <div style={{ fontSize: '14px', color: COLORS.textSecondary }}>
                      ✅ {assignment.task.pointsDone} pts • ⭐ {assignment.task.pointsExtraWellDone} pts
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

