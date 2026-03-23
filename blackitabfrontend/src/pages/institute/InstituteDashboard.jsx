import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';

import InstituteBanner from '../../components/institute/dashboard/InstituteBanner';
import InstituteStatsGrid from '../../components/institute/dashboard/InstituteStatsGrid';
import InstituteQuickLinks from '../../components/institute/dashboard/InstituteQuickLinks';

const InstituteDashboard = () => {
  const [stats, setStats] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, instRes] = await Promise.all([
        api.get('/institute/stats'),
        api.get('/institute/my')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (instRes.data.success) setInstitute(instRes.data.data);
    } catch (error) {
      CustomToast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="dashboard" />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      <InstituteBanner 
        institute={institute} 
        showCode={showCode} 
        setShowCode={setShowCode} 
      />
      <InstituteStatsGrid 
        stats={stats} 
        navigate={navigate} 
      />
      <InstituteQuickLinks 
        institute={institute} 
        navigate={navigate} 
      />
    </div>
  );
};

export default InstituteDashboard;
