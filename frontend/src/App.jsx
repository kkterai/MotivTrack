import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { useTaskStore } from './stores/useTaskStore';
import { usePointStore } from './stores/usePointStore';
import { useRewardStore } from './stores/useRewardStore';
import { useNotificationStore } from './stores/useNotificationStore';
import { ProtectedRoute, Header } from './components/layout';
import { Login, ChildDashboard, ParentDashboard, TeacherPortal } from './pages';
import { useEffect, useState } from 'react';

/**
 * App - Main application component with routing
 * Implements role-based routing and protected routes
 * Connected to backend API via Zustand stores
 */
export default function App() {
  const { user, token } = useAuthStore();
  const isAuthenticated = token !== null && user !== null;

  console.log('App rendering - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', token);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getRoleBasedRoute(user.role)} replace />
            ) : (
              <LoginContainer />
            )
          }
        />

        {/* Protected Route - Child Dashboard */}
        <Route
          path="/child"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <Header title="My Dashboard" />
              <ChildDashboardContainer />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Parent Dashboard */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['admin_parent', 'delivery_parent']}>
              <Header title="Parent Dashboard" />
              <ParentDashboardContainer />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Teacher Portal */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <Header title="Teacher Portal" showLogout={true} />
              <TeacherPortalContainer />
            </ProtectedRoute>
          }
        />

        {/* Catch-all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Helper function to get the appropriate route based on user role
 */
function getRoleBasedRoute(role) {
  switch (role) {
    case 'child':
      return '/child';
    case 'admin_parent':
    case 'delivery_parent':
      return '/parent';
    case 'teacher':
      return '/teacher';
    default:
      return '/';
  }
}

/**
 * LoginContainer - Handles authentication
 */
function LoginContainer() {
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState(null);

  const handleLogin = async (email, password) => {
    try {
      setLocalError(null);
      clearError();
      await login(email, password);
      // Navigation handled by route redirect
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (userData) => {
    try {
      setLocalError(null);
      clearError();
      await register(userData);
      // Navigation handled by route redirect
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Login
      onLogin={handleLogin}
      onRegister={handleRegister}
      loading={isLoading}
      error={localError || error}
    />
  );
}

/**
 * ChildDashboardContainer - Connects child dashboard to stores
 */
function ChildDashboardContainer() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, createClaim } = useTaskStore();
  const { balance, fetchBalance } = usePointStore();
  const { rewards, fetchRewards, redeemReward } = useRewardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  
  const [loading, setLoading] = useState(true);
  const [latestTeacherReport, setLatestTeacherReport] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.childProfileId) return;
      
      try {
        setLoading(true);
        await Promise.all([
          fetchTasks(user.childProfileId),
          fetchBalance(user.childProfileId),
          fetchRewards(user.childProfileId),
          fetchNotifications(),
        ]);
      } catch (error) {
        console.error('Error loading child dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.childProfileId]);

  // Extract latest teacher report from notifications
  useEffect(() => {
    const teacherNotifications = notifications.filter(n => 
      n.type === 'teacher_report' && n.metadata?.points > 0
    );
    if (teacherNotifications.length > 0) {
      setLatestTeacherReport(teacherNotifications[0].metadata);
    }
  }, [notifications]);

  const handleSubmitTask = async (taskId, quality) => {
    try {
      await createClaim({
        taskId,
        childProfileId: user.childProfileId,
        quality,
      });
      // Refresh tasks after submission
      await fetchTasks(user.childProfileId);
    } catch (error) {
      console.error('Error submitting task:', error);
      alert('Failed to submit task. Please try again.');
    }
  };

  const handleRedeemReward = async (reward) => {
    try {
      await redeemReward(reward.id, user.childProfileId);
      // Refresh data after redemption
      await Promise.all([
        fetchBalance(user.childProfileId),
        fetchRewards(user.childProfileId),
      ]);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#5f6368',
      }}>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <ChildDashboard
      tasks={tasks}
      onSubmitTask={handleSubmitTask}
      points={balance?.total || 0}
      goal={20}
      streak={balance?.streak || 0}
      bonusAwarded={false}
      rewards={rewards}
      onRedeemReward={handleRedeemReward}
      latestTeacherReport={latestTeacherReport}
      readOnly={false}
    />
  );
}

/**
 * ParentDashboardContainer - Connects parent dashboard to stores
 */
function ParentDashboardContainer() {
  const { user } = useAuthStore();
  const { tasks, claims, fetchTasks, fetchClaims, verifyClaim } = useTaskStore();
  const { rewards, redemptions, fetchRewards, fetchRedemptions, markDelivered } = useRewardStore();
  
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        // TODO: Fetch children profiles
        // For now, using mock structure
        await Promise.all([
          fetchTasks(user.id),
          fetchClaims(user.id),
          fetchRewards(user.id),
          fetchRedemptions(user.id),
        ]);
      } catch (error) {
        console.error('Error loading parent dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleApproveClaim = async (claimId) => {
    try {
      await verifyClaim(claimId, 'approved', user.id);
      await fetchClaims(user.id);
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Failed to approve task. Please try again.');
    }
  };

  const handleApproveClaimExtra = async (claimId) => {
    try {
      await verifyClaim(claimId, 'approved_extra', user.id);
      await fetchClaims(user.id);
    } catch (error) {
      console.error('Error approving claim with bonus:', error);
      alert('Failed to approve task. Please try again.');
    }
  };

  const handleRequestRedo = async (claimId) => {
    try {
      await verifyClaim(claimId, 'redo', user.id);
      await fetchClaims(user.id);
    } catch (error) {
      console.error('Error requesting redo:', error);
      alert('Failed to request redo. Please try again.');
    }
  };

  const handleMarkDelivered = async (redemptionId) => {
    try {
      await markDelivered(redemptionId, user.id);
      await fetchRedemptions(user.id);
    } catch (error) {
      console.error('Error marking delivered:', error);
      alert('Failed to mark as delivered. Please try again.');
    }
  };

  // Task/Reward management handlers (for admin_parent only)
  const handleAddTask = async (taskData) => {
    console.log('Add task:', taskData);
    // TODO: Implement task creation API call
  };

  const handleEditTask = async (taskId, taskData) => {
    console.log('Edit task:', taskId, taskData);
    // TODO: Implement task update API call
  };

  const handleArchiveTask = async (taskId) => {
    console.log('Archive task:', taskId);
    // TODO: Implement task archive API call
  };

  const handleAddReward = async (rewardData) => {
    console.log('Add reward:', rewardData);
    // TODO: Implement reward creation API call
  };

  const handleEditReward = async (rewardId, rewardData) => {
    console.log('Edit reward:', rewardId, rewardData);
    // TODO: Implement reward update API call
  };

  const handleRetireReward = async (rewardId) => {
    console.log('Retire reward:', rewardId);
    // TODO: Implement reward retire API call
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#5f6368',
      }}>
        Loading your dashboard...
      </div>
    );
  }

  // Filter pending claims and redemptions
  const pendingClaims = claims.filter(c => c.status === 'pending');
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');

  return (
    <ParentDashboard
      userRole={user?.role}
      children={children}
      pendingClaims={pendingClaims}
      onApproveClaim={handleApproveClaim}
      onApproveClaimExtra={handleApproveClaimExtra}
      onRequestRedo={handleRequestRedo}
      pendingRedemptions={pendingRedemptions}
      onMarkDelivered={handleMarkDelivered}
      tasks={tasks}
      onAddTask={handleAddTask}
      onEditTask={handleEditTask}
      onArchiveTask={handleArchiveTask}
      rewards={rewards}
      onAddReward={handleAddReward}
      onEditReward={handleEditReward}
      onRetireReward={handleRetireReward}
      teachers={[]}
      teacherReportsToday={[]}
      today={new Date().toLocaleDateString()}
    />
  );
}

/**
 * TeacherPortalContainer - Connects teacher portal to stores
 */
function TeacherPortalContainer() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [expectations, setExpectations] = useState([]);
  const [children, setChildren] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // TODO: Fetch teachers, expectations, and children from API
        // For now, using empty arrays
      } catch (error) {
        console.error('Error loading teacher portal:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitReport = async (report) => {
    try {
      console.log('Submit report:', report);
      // TODO: Implement teacher report submission API call
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: '#5f6368',
      }}>
        Loading teacher portal...
      </div>
    );
  }

  return (
    <TeacherPortal
      teachers={teachers}
      expectations={expectations}
      children={children}
      onSubmitReport={handleSubmitReport}
      teacherReports={[]}
      teachersPendingToday={[]}
      today={new Date().toLocaleDateString()}
      todayKey={new Date().toISOString().split('T')[0]}
    />
  );
}
