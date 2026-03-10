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
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
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

  if (loading) return <LoadingSpinner />;

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
      path: '/institute/profile' 
    },
    { 
      title: 'Pending Questions', 
      value: stats?.pendingQuestions || 0, 
      icon: CheckBadgeIcon, 
      color: 'orange', 
      path: '/institute/questions' 
    }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">
      
      {/* Banner Section */}
      <div className="relative rounded-[2rem] overflow-hidden glass-panel h-48 lg:h-64 shadow-2xl border border-gray-200 dark:border-white/10">
        {institute?.bannerImage ? (
          <img 
            src={institute.bannerImage} 
            alt="Institute Banner" 
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-transparent flex flex-col items-center justify-center">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No banner image set</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-md">{institute?.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-200">
            <div className="flex items-center gap-1 font-mono text-orange-400 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
              <span>CODE: {showCode ? institute?.instituteCode : '••••••••'}</span>
              <button onClick={() => setShowCode(!showCode)} className="ml-1 hover:text-orange-300 transition-colors" title={showCode ? "Hide Code" : "Show Code"}>
                {showCode ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
            {institute?.address && <span className="drop-shadow-sm font-medium">{institute.address}</span>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className={`
              glass-panel border-gray-200 dark:border-white/10 rounded-2xl p-6
              hover:border-${card.color}-500/50 transition-all duration-300
              cursor-pointer group relative overflow-hidden
            `}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:bg-${card.color}-500/20 transition-all`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">{card.value}</h3>
              </div>
              <div className={`p-3 bg-gray-100 dark:bg-white/5 shadow-inner border border-gray-200 dark:border-white/10 rounded-xl text-${card.color}-500 dark:text-${card.color}-400 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 tracking-tight">
                <DocumentTextIcon className="w-5 h-5 text-blue-500" />
                About Institute
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                {institute?.description || 'No description provided by the institute. Head over to the Profile section to add details.'}
            </p>
        </div>
        
        <div className="glass-panel border-gray-200 dark:border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Quick Links</h3>
            <div className="space-y-3">
                <button onClick={() => navigate('/institute/join-requests')} className="w-full text-left px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 cursor-pointer group shadow-sm font-medium">
                    <span>Manage Join Requests</span>
                    <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">&rarr;</span>
                </button>
                <button onClick={() => navigate('/institute/theory')} className="w-full text-left px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 cursor-pointer group shadow-sm font-medium">
                    <span>Manage Theory Files</span>
                    <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">&rarr;</span>
                </button>
                <button onClick={() => navigate('/institute/questions')} className="w-full text-left px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors flex items-center justify-between text-gray-700 dark:text-gray-300 cursor-pointer group shadow-sm font-medium">
                    <span>Review Questions</span>
                    <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">&rarr;</span>
                </button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default InstituteDashboard;
