import React from 'react';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  BuildingOfficeIcon,
  CheckBadgeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const InstituteStatsGrid = ({ stats, navigate }) => {
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
  );
};

export default InstituteStatsGrid;
