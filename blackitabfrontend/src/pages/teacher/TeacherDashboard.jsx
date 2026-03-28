import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';

import TeacherHeader from '../../components/teacher/dashboard/TeacherHeader';
import TeacherMetricCards from '../../components/teacher/dashboard/TeacherMetricCards';
import TeacherProfileMetrics from '../../components/teacher/dashboard/TeacherProfileMetrics';
import TeacherQuickActions from '../../components/teacher/dashboard/TeacherQuickActions';

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/dashboard`, { headers });
      setDashboard(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="dashboard" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#f8f9fa] dark:bg-black font-sans">
      <p className="text-red-500 font-semibold">{error}</p>
      <button onClick={fetchDashboard} className="px-6 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
        Retry Connection
      </button>
    </div>
  );

  const d = dashboard || {};

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] font-sans pb-24 transition-colors overflow-x-hidden">
      <TeacherHeader user={user} />

      <div className="max-w-[90rem] mx-auto px-6 sm:px-10 lg:px-14 py-10 space-y-10">
        <TeacherMetricCards dashboard={d} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <TeacherProfileMetrics d={d} />
          <TeacherQuickActions />
        </div>
      </div>
    </div>
  );
}
