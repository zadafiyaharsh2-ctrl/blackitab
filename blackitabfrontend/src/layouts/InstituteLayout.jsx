import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import InstituteSidebar from '../components/institute/InstituteSidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const InstituteLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const isAuthenticated = !!localStorage.getItem('token') && !!user;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Optionally strictly require 'institute_admin', 'hod', or 'teacher' roles for this layout
  if (!['institute_admin', 'hod', 'teacher'].includes(user?.role)) {
     return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 font-sans">
      
      <InstituteSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-gray-200 dark:border-white/10 glass-panel !rounded-none flex items-center justify-between px-4 shrink-0 shadow-sm relative z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              I
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Institute</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -mr-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstituteLayout;
