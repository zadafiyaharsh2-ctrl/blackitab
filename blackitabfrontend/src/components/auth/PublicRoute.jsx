import { Navigate } from 'react-router-dom';

const ROLE_HOME = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  hod: '/teacher-dashboard',
  institute_admin: '/institute/dashboard',
  institute: '/institute/dashboard',
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  // If user is already logged in, redirect to their role-appropriate page
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      return <Navigate to={ROLE_HOME[user.role] || '/dashboard'} replace />;
    } catch {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;

