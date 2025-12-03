import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // If user is already logged in, redirect to dashboard
  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;

