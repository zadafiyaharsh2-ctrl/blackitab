import React from 'react';
import { FaChartLine } from 'react-icons/fa';

const AdminHeader = ({ tabs, activeTab }) => {
  const currentTab = tabs.find(t => t.id === activeTab);
  
  return (
    <header className="bg-admin-surface/60 backdrop-blur-xl border-b border-admin-outline-variant/20 sticky top-0 z-50 flex justify-between items-center px-8 h-20 w-full shadow-[0_32px_32px_-4px_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-6">
         <h2 className="text-xl font-bold text-admin-on-surface flex items-center gap-3">
           {currentTab ? React.createElement(currentTab.icon, { className: 'text-admin-primary' }) : <FaChartLine className="text-admin-primary" />}
           {currentTab ? currentTab.label : 'Overview'}
         </h2>
      </div>
    </header>
  );
};

export default AdminHeader;
