import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

/**
 * ProtectedRoute - Wrapper component for routes that require authentication
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} props.allowedRoles - Optional array of allowed roles
 */
export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, isAuthenticated } = useAuthStore();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check role if specified
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    switch (user?.role) {
      case 'child':
        return <Navigate to="/child" replace />;
      case 'admin_parent':
      case 'delivery_parent':
        return <Navigate to="/parent" replace />;
      case 'teacher':
        return <Navigate to="/teacher" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Authorized - render children
  return children;
}
