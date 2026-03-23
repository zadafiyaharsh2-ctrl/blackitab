import React from 'react';
import { Activity } from 'lucide-react';

const StudentWeeklyActivity = ({ weeklyActivity }) => {
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-white/[0.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-500" /> Weekly Activity
        </h3>
        {weeklyActivity?.length > 0 && (
          <span className="text-[10px] text-gray-400">{weeklyActivity.reduce((s, d) => s + d.count, 0)} problems this week</span>
        )}
      </div>
      {weeklyActivity?.length > 0 ? (
        <div className="flex items-end gap-2 h-28">
          {weeklyActivity.map((day, index) => {
            const max = Math.max(...weeklyActivity.map((item) => item.count), 1);
            const pct = (day.count / max) * 100;
            const isToday = index === weeklyActivity.length - 1;
            return (
              <div key={`${day.day}-${index}`} className="group flex flex-col items-center gap-1.5 flex-1">
                <div className="relative w-full flex items-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-600 to-cyan-400 shadow-sm shadow-blue-500/30'
                        : 'bg-blue-200 dark:bg-blue-500/30 group-hover:bg-blue-300 dark:group-hover:bg-blue-500/50'
                    }`}
                    style={{ height: `${Math.max(pct, 5)}%`, minHeight: '4px' }}
                  />
                  {day.count > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>{day.day}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-28 flex flex-col items-center justify-center text-gray-400">
          <Activity className="h-6 w-6 mb-2 opacity-30" />
          <p className="text-xs">Solve problems to see activity.</p>
        </div>
      )}
    </div>
  );
};

export default StudentWeeklyActivity;
