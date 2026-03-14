import React from 'react';
import { FaExclamationTriangle, FaCheck } from 'react-icons/fa';

const AnalyticsTab = ({ globalAnalytics, teacherAnalytics }) => {
  return (
    <div}}>
      <h2 className="text-xl font-bold text-white mb-6">Global Platform Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 border border-white/10 rounded-2xl">
          <h3 className="font-bold text-white mb-4">Engagement Overview</h3>
          {globalAnalytics ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">Total Question Attempts</p>
                <p className="text-2xl font-bold text-blue-400">{globalAnalytics.overview.totalAttempts}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">Total Social Posts</p>
                <p className="text-2xl font-bold text-cyan-400">{globalAnalytics.overview.totalPosts}</p>
              </div>
            </div>
          ) : <p className="text-gray-500">Loading analytics...</p>}
        </div>

        <div className="glass-panel p-6 border border-white/10 rounded-2xl">
          <h3 className="font-bold text-white mb-4">Latest Signups</h3>
          {globalAnalytics?.recentSignups ? (
            <div className="space-y-3">
              {globalAnalytics.recentSignups.map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                  <span className="text-white font-medium">{user.name}</span>
                  <span className="text-gray-400 text-xs uppercase">{user.role}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500">Loading signups...</p>}
        </div>
      </div>

      <h3 className="font-bold text-white mb-4 text-lg">Global Teacher Feedback</h3>
      <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr className="text-xs text-gray-500 uppercase tracking-wider text-left">
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Institute</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {teacherAnalytics.map(t => (
              <tr key={t._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${t.isFlagged ? 'bg-red-500/20 text-red-400' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                      {t.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-gray-500 text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{t.instituteName}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${t.avgRating >= 4 ? 'text-emerald-400' : t.avgRating >= 2.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {t.avgRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 text-xs">/ 5.0</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{t.feedbackCount}</td>
                <td className="px-4 py-3">
                  {t.isFlagged ? (
                    <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                      <FaExclamationTriangle /> Flagged
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 w-fit">
                      <FaCheck /> Good Standing
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {teacherAnalytics.length === 0 && (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No teachers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsTab;
