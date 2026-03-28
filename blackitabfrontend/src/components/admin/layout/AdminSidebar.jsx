import React from 'react';
import { FaShieldAlt, FaSignOutAlt } from 'react-icons/fa';

const AdminSidebar = ({ admin, tabs, activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="fixed left-0 h-full w-64 border-r border-admin-outline-variant/20 bg-admin-surface-container-low flex flex-col gap-2 p-6 z-[60]">
      <div className="mb-10 px-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-admin-primary to-admin-primary-container flex items-center justify-center shadow-[0_0_15px_rgba(0,97,255,0.4)]">
            <FaShieldAlt className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-admin-primary-fixed-dim tracking-tighter">RANKLEN</h1>
            <p className="text-[10px] text-admin-on-surface-variant tracking-[0.1em] uppercase font-bold opacity-60">Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-admin-surface-container-high/50 border border-admin-outline-variant/10">
          <div className="w-8 h-8 rounded-lg bg-admin-surface-container-highest flex items-center justify-center text-white font-bold">{admin?.username?.[0]?.toUpperCase() || 'A'}</div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-admin-on-surface truncate">{admin?.username || 'Elite Administrator'}</p>
            <p className="text-[10px] text-admin-on-surface-variant truncate">System Active</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={activeTab === t.id 
              ? "bg-[#0061ff] text-white rounded-lg shadow-[0_0_15px_rgba(0,97,255,0.4)] flex items-center gap-3 px-4 py-3 translate-x-1 transition-transform group"
              : "text-[#c2c6d9] hover:text-white hover:bg-[#222a3d] transition-colors duration-200 flex items-center gap-3 px-4 py-3 rounded-lg group"}>
            <t.icon className="text-lg" />
            <span className="font-['Inter'] text-xs tracking-[0.05rem] uppercase font-semibold">{t.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-admin-outline-variant/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-admin-error rounded-lg hover:bg-admin-error/10 transition-colors">
          <FaSignOutAlt className="text-lg" />
          <span className="font-semibold text-xs uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
