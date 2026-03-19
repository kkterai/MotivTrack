import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { ProtectedRoute, Header } from './components/layout';
import { Login, ChildDashboard, ParentDashboard, TeacherPortal } from './pages';

/**
 * App - Main application component with routing
 * Implements role-based routing and protected routes
 */
export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              // Redirect to appropriate dashboard if already logged in
              <Navigate to={getRoleBasedRoute(user?.role)} replace />
            ) : (
              <Login
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={false}
                error={null}
              />
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
 * Container components that will connect to stores and API
 * These will be implemented in Phase 6
 */

function ChildDashboardContainer() {
  // TODO: Phase 6 - Connect to stores and API
  // For now, using mock data
  const mockData = {
    tasks: [],
    points: 0,
    goal: 20,
    streak: 0,
    bonusAwarded: false,
    rewards: [],
    latestTeacherReport: null,
  };

  const handleSubmitTask = (taskId, quality) => {
    console.log('Submit task:', taskId, quality);
    // TODO: Phase 6 - Call API
  };

  const handleRedeemReward = (reward) => {
    console.log('Redeem reward:', reward);
    // TODO: Phase 6 - Call API
  };

  return (
    <ChildDashboard
      tasks={mockData.tasks}
      onSubmitTask={handleSubmitTask}
      points={mockData.points}
      goal={mockData.goal}
      streak={mockData.streak}
      bonusAwarded={mockData.bonusAwarded}
      rewards={mockData.rewards}
      onRedeemReward={handleRedeemReward}
      latestTeacherReport={mockData.latestTeacherReport}
      readOnly={false}
    />
  );
}

function ParentDashboardContainer() {
  const { user } = useAuthStore();
  
  // TODO: Phase 6 - Connect to stores and API
  // For now, using mock data
  const mockData = {
    children: [],
    pendingClaims: [],
    pendingRedemptions: [],
    tasks: [],
    rewards: [],
    teachers: [],
    teacherReportsToday: [],
    today: new Date().toLocaleDateString(),
  };

  const handleApproveClaim = (claimId) => {
    console.log('Approve claim:', claimId);
    // TODO: Phase 6 - Call API
  };

  const handleApproveClaimExtra = (claimId) => {
    console.log('Approve claim with bonus:', claimId);
    // TODO: Phase 6 - Call API
  };

  const handleRequestRedo = (claimId) => {
    console.log('Request redo:', claimId);
    // TODO: Phase 6 - Call API
  };

  const handleMarkDelivered = (redemptionId) => {
    console.log('Mark delivered:', redemptionId);
    // TODO: Phase 6 - Call API
  };

  const handleAddTask = (taskData) => {
    console.log('Add task:', taskData);
    // TODO: Phase 6 - Call API
  };

  const handleEditTask = (taskId, taskData) => {
    console.log('Edit task:', taskId, taskData);
    // TODO: Phase 6 - Call API
  };

  const handleArchiveTask = (taskId) => {
    console.log('Archive task:', taskId);
    // TODO: Phase 6 - Call API
  };

  const handleAddReward = (rewardData) => {
    console.log('Add reward:', rewardData);
    // TODO: Phase 6 - Call API
  };

  const handleEditReward = (rewardId, rewardData) => {
    console.log('Edit reward:', rewardId, rewardData);
    // TODO: Phase 6 - Call API
  };

  const handleRetireReward = (rewardId) => {
    console.log('Retire reward:', rewardId);
    // TODO: Phase 6 - Call API
  };

  return (
    <ParentDashboard
      userRole={user?.role}
      children={mockData.children}
      pendingClaims={mockData.pendingClaims}
      onApproveClaim={handleApproveClaim}
      onApproveClaimExtra={handleApproveClaimExtra}
      onRequestRedo={handleRequestRedo}
      pendingRedemptions={mockData.pendingRedemptions}
      onMarkDelivered={handleMarkDelivered}
      tasks={mockData.tasks}
      onAddTask={handleAddTask}
      onEditTask={handleEditTask}
      onArchiveTask={handleArchiveTask}
      rewards={mockData.rewards}
      onAddReward={handleAddReward}
      onEditReward={handleEditReward}
      onRetireReward={handleRetireReward}
      teachers={mockData.teachers}
      teacherReportsToday={mockData.teacherReportsToday}
      today={mockData.today}
    />
  );
}

function TeacherPortalContainer() {
  // TODO: Phase 6 - Connect to stores and API
  // For now, using mock data
  const mockData = {
    teachers: [],
    expectations: [],
    children: [],
    teacherReports: [],
    teachersPendingToday: [],
    today: new Date().toLocaleDateString(),
    todayKey: new Date().toISOString().split('T')[0],
  };

  const handleSubmitReport = async (report) => {
    console.log('Submit report:', report);
    // TODO: Phase 6 - Call API
  };

  return (
    <TeacherPortal
      teachers={mockData.teachers}
      expectations={mockData.expectations}
      children={mockData.children}
      onSubmitReport={handleSubmitReport}
      teacherReports={mockData.teacherReports}
      teachersPendingToday={mockData.teachersPendingToday}
      today={mockData.today}
      todayKey={mockData.todayKey}
    />
  );
}

/**
 * Auth handlers - will be connected to auth store in Phase 6
 */
async function handleLogin(email, password) {
  console.log('Login:', email);
  // TODO: Phase 6 - Call auth API
  // const { login } = useAuthStore.getState();
  // await login(email, password);
}

async function handleRegister(userData) {
  console.log('Register:', userData);
  // TODO: Phase 6 - Call auth API
  // const { register } = useAuthStore.getState();
  // await register(userData);
}
