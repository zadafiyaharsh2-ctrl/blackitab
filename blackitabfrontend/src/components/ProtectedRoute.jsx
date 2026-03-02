import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — Guards routes that require authentication.
 * Optionally checks user role with `requiredRoles` prop.
 * 
 * Usage:
 *   <ProtectedRoute>                                          → any logged-in user
 *   <ProtectedRoute requiredRoles={['teacher', 'hod']}>       → only teacher/hod
 */
const ProtectedRoute = ({ children, requiredRoles }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  // Role-based access check
  if (requiredRoles && requiredRoles.length > 0) {
    try {
      const user = JSON.parse(userData);
      if (!requiredRoles.includes(user.role)) {
        // Redirect unauthorized roles to their dashboard
        return <Navigate to="/dashboard" replace />;
      }
    } catch {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
