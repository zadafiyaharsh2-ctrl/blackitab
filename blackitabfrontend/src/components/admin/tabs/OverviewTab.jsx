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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="glass-panel p-6 border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{loading ? '...' : s.value?.toLocaleString?.() ?? 0}</p>
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
              <s.icon className={`text-xl ${s.color}`} />
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
