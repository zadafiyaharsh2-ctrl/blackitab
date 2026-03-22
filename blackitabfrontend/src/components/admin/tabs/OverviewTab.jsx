import React from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
};

const OverviewTab = ({ stats, loading, statCards }) => {
  return (
    <div initial="hidden" animate="visible">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {statCards.map((s, i) => (
          <div key={i} className="bg-admin-surface-container-high/40 backdrop-blur-xl border border-admin-outline-variant/20 p-6 rounded-2xl flex flex-col justify-between hover:border-admin-primary/40 transition-all group hover:shadow-[0_0_30px_rgba(0,97,255,0.1)]">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-admin-primary/10 flex items-center justify-center text-admin-primary border border-admin-primary/20 group-hover:bg-admin-primary/20 transition-colors">
                <s.icon className="text-2xl" />
              </div>
              <span className="text-xs font-bold text-admin-on-surface-variant bg-admin-surface-container-highest/80 px-2 py-1 rounded-lg">
                Active
              </span>
            </div>
            <div>
              <p className="text-4xl font-black text-admin-on-surface tracking-tighter">
                {loading ? '...' : s.value?.toLocaleString?.() ?? 0}
              </p>
              <p className="text-[10px] text-admin-on-surface-variant uppercase tracking-widest font-bold mt-2">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Role Distribution */}
      {stats?.roleCounts && (
        <div className="glass-panel p-6 mb-8">
          <h3 className="font-bold text-white mb-6 text-lg">Role Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.roleCounts).map(([role, count]) => {
              const colors = { student: 'from-blue-500 to-cyan-500', teacher: 'from-emerald-500 to-teal-500', hod: 'from-purple-500 to-pink-500', institute: 'from-orange-500 to-red-500' };
              const total = Object.values(stats.roleCounts).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={role} className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <p className="text-2xl font-bold text-white mb-1">{count}</p>
                  <p className="text-xs text-gray-500 capitalize mb-3">{role.replace('_', ' ')}</p>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${colors[role] || 'from-gray-500 to-gray-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hierarchy Visualization */}
      <div className="glass-panel p-6">
        <h3 className="font-bold text-white mb-6 text-lg">Platform Hierarchy</h3>
        <div className="flex flex-col items-center gap-3">
          {[
            { role: 'System Admin', desc: 'Full platform control — users, institutes, question approval, posts, contests', color: 'from-red-500 to-orange-500', count: 1 },
            { role: 'Institute Admin', desc: 'Manage institute members, assign roles', color: 'from-orange-500 to-yellow-500', count: stats?.roleCounts?.institute || 0 },
            { role: 'HOD', desc: 'Department oversight, teacher management', color: 'from-purple-500 to-pink-500', count: stats?.roleCounts?.hod || 0 },
            { role: 'Teacher', desc: 'Create questions (require approval for global), view analytics', color: 'from-emerald-500 to-teal-500', count: stats?.roleCounts?.teacher || 0 },
            { role: 'Student', desc: 'Learn, practice, compete', color: 'from-blue-500 to-cyan-500', count: stats?.roleCounts?.student || 0 },
          ].map((level, i) => (
            <React.Fragment key={level.role}>
              {i > 0 && <div className="w-0.5 h-4 bg-white/10" />}
              <div className={`w-full max-w-lg p-4 rounded-xl border border-white/10 flex items-center justify-between`}
                style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6))`, borderLeft: `3px solid` }}>
                <div>
                  <p className="font-bold text-white text-sm">{level.role}</p>
                  <p className="text-xs text-gray-400">{level.desc}</p>
                </div>
                <span className={`text-lg font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>{level.count}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
