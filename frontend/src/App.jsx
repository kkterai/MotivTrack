import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { ProtectedRoute } from './components/layout';
import { Login, ChildDashboard, ParentDashboard, TeacherPortal } from './pages';
import ParentOnboarding from './pages/ParentOnboarding';
import ChildOnboarding from './pages/ChildOnboarding';
import ClaimAccount from './pages/ClaimAccount';

/**
 * App - Main application component with routing
 * Implements role-based routing and protected routes
 * Connected to backend API via Zustand stores
 */
export default function App() {
  const { user, token, login, register, isLoading, error } = useAuthStore();
  const isAuthenticated = token !== null && user !== null;

  console.log('App rendering - isAuthenticated:', isAuthenticated, 'user:', user);

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
              <Login 
                onLogin={login}
                onRegister={register}
                loading={isLoading}
                error={error}
              />
            )
          }
        />

        {/* Public Route - Claim Account (Child Registration via Invitation) */}
        <Route path="/claim-account" element={<ClaimAccount />} />

        {/* Protected Route - Child Onboarding */}
        <Route
          path="/child/onboarding"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <ChildOnboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Child Dashboard */}
        <Route
          path="/child"
          element={
            <ProtectedRoute allowedRoles={['child']}>
              <ChildDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Parent Onboarding */}
        <Route
          path="/parent/onboarding"
          element={
            <ProtectedRoute allowedRoles={['admin_parent']}>
              <ParentOnboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Parent Dashboard */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['admin_parent', 'delivery_parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Teacher Portal */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherPortal />
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
