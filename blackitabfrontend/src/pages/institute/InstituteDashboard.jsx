import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';

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

  const statCards = [
    { 
      title: 'Total Teachers', 
      value: stats?.roleCounts?.teacher || 0, 
      icon: AcademicCapIcon, 
      color: 'blue', 
      path: '/institute/teachers' 
    },
    { 
      title: 'Total Students', 
      value: stats?.roleCounts?.student || 0, 
      icon: UsersIcon, 
      color: 'emerald', 
      path: '/institute/students' 
    },
    { 
      title: 'Departments', 
      value: stats?.departmentsCount || 0, 
      icon: BuildingOfficeIcon, 
      color: 'purple', 
      path: '/institute/departments' 
    },
    { 
      title: 'Total Questions', 
      value: stats?.questions || 0, 
      icon: CheckBadgeIcon, 
      color: 'orange', 
      path: '/institute/questions' 
    },
    { 
      title: 'Join Requests', 
      value: stats?.pendingJoinRequests || 0, 
      icon: UserPlusIcon, 
      color: 'rose', 
      path: '/institute/join-requests' 
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:shadow-none h-48 bg-white/70 dark:bg-white/5 backdrop-blur-xl">
        {institute?.bannerImage ? (
          <img src={institute.bannerImage} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <BuildingOfficeIcon className="w-10 h-10 mb-1 opacity-30" />
            <p className="text-xs">No banner image</p>
          </div>
        )}
        {institute?.bannerImage && <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />}
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className={`text-xl font-bold ${institute?.bannerImage ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{institute?.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded border ${institute?.bannerImage ? 'text-white border-white/30 bg-black/30' : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-white/20 bg-white/80 dark:bg-black/30'}`}>
              CODE: {showCode ? institute?.instituteCode : '••••••'}
              <button onClick={() => setShowCode(!showCode)} className="ml-0.5">
                {showCode ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
              </button>
            </span>
            {institute?.address && <span className={`text-xs ${institute?.bannerImage ? 'text-gray-200' : 'text-gray-500'}`}>{institute.address}</span>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} onClick={() => navigate(card.path)}
            className="rounded-2xl p-5 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none cursor-pointer hover:bg-white/90 dark:hover:bg-white/[0.06] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col items-start gap-1"
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
          </div>
        ))}
      </div>

      {/* About + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <DocumentTextIcon className="w-4 h-4" /> About Institute
          </h3>
          <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap font-medium">
            {institute?.description || 'No description provided. Head to Profile to add details.'}
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col">
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Quick Links</h3>
          </div>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {[
              { label: 'Manage Theory Files', path: '/institute/theory' },
              { label: 'Review Questions', path: '/institute/questions' },
              { label: 'Join Requests', path: '/institute/join-requests' },
            ].map((l, i) => (
              <button key={i} onClick={() => navigate(l.path)} className="w-full text-left px-4 py-3 text-[15px] font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group">
                {l.label} <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
