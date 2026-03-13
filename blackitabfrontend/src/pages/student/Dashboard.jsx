import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';
import StudentAnalyticsContent from '../../components/student/StudentAnalyticsContent';

const Dashboard = () => {
  usePageTitle('Dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'teacher' || user.role === 'hod') {
        navigate('/teacher-dashboard', { replace: true });
      } else if (user.role === 'institute_admin' || user.role === 'institute') {
        navigate('/institute/dashboard', { replace: true });
      }
    } catch {}
  }, [navigate]);

  return <StudentAnalyticsContent />;
};

export default Dashboard;
