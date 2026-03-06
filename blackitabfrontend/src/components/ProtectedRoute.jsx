import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — Guards routes that require authentication.
 *
 * Security layers:
 * 1. Token existence check
 * 2. Role-based access (optional `requiredRoles` prop)
 * 3. Banned user check
 *
 * Usage:
 *   <ProtectedRoute>                                          → any logged-in user
 *   <ProtectedRoute requiredRoles={['teacher', 'hod']}>       → only teacher/hod
 */
const ProtectedRoute = ({ children, requiredRoles }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // 1. Must be logged in
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userData);

    // 2. Banned users get kicked out
    if (user.isBanned) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // 3. Role-based access check
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        // Redirect unauthorized roles to their appropriate dashboard
        const roleHome = {
          student: '/dashboard',
          teacher: '/teacher-dashboard',
          hod: '/teacher-dashboard',
          institute_admin: '/institute-dashboard',
        };
        return <Navigate to={roleHome[user.role] || '/dashboard'} replace />;
      }
    }
  } catch {
    // Corrupt user data — force re-login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
