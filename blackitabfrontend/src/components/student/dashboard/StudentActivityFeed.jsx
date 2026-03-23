import React from 'react';
import { Activity, Code } from 'lucide-react';

const StudentActivityFeed = ({ recentActivityItems, activityCompletedCount, activityAttemptedCount, activityCompletionRate }) => {
  return (
    <div className="relative border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-14 -right-16 w-44 h-44 rounded-full bg-emerald-200/40 dark:bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Code className="h-3.5 w-3.5" /> Recent Activity
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              {activityCompletedCount} solved
            </span>
            <span className="px-2 py-1 rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300">
              {activityAttemptedCount} attempts
            </span>
          </div>
        </div>

        {recentActivityItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.02] backdrop-blur-sm p-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Latest update</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{recentActivityItems[0]?.timeLabel || '—'}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Completion</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{activityCompletionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 transition-all duration-700"
                    style={{ width: `${activityCompletionRate}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="border border-gray-200 dark:border-white/10 rounded-lg py-2">
                  <p className="text-[10px] text-gray-400">Solved</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{activityCompletedCount}</p>
                </div>
                <div className="border border-gray-200 dark:border-white/10 rounded-lg py-2">
                  <p className="text-[10px] text-gray-400">Timeline</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{recentActivityItems.length}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-2.5">
              {recentActivityItems.map((activity, index) => (
                <div
                  key={activity.id}
                  className="relative rounded-xl border border-gray-200 dark:border-white/10 bg-white/85 dark:bg-white/[0.02] backdrop-blur-sm px-4 py-3 pl-10"
                >
                  {index < recentActivityItems.length - 1 && (
                    <span className={`absolute left-[15px] top-8 bottom-[-13px] w-px bg-gradient-to-b ${activity.statusVisual.line}`} />
                  )}
                  <span className={`absolute left-3 top-3.5 w-4 h-4 rounded-full ring-2 ring-white dark:ring-gray-900 ${activity.statusVisual.dot} flex items-center justify-center`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/95" />
                  </span>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activity.visual.pill}`}>
                          {activity.difficulty}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activity.statusVisual.chip}`}>
                          {activity.statusVisual.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{activity.timeLabel}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold shrink-0 ${activity.statusVisual.label === 'Solved' ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {activity.statusVisual.insight}
                    </span>
                  </div>

                  <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${activity.visual.track}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${activity.visual.bar} transition-all duration-700`}
                      style={{ width: `${activity.intensity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <Activity className="h-6 w-6 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No activity yet. Start solving.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentActivityFeed;
