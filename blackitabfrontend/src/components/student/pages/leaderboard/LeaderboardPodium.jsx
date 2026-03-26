import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaStar } from 'react-icons/fa';

const RANK_STYLES = {
  1: { shell: 'from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-400/5', border: 'border-amber-300 dark:border-amber-400/30', badge: 'bg-amber-500 text-white' },
  2: { shell: 'from-slate-100 to-slate-50 dark:from-slate-500/20 dark:to-slate-400/5', border: 'border-slate-300 dark:border-slate-400/30', badge: 'bg-slate-500 text-white' },
  3: { shell: 'from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-400/5', border: 'border-orange-300 dark:border-orange-400/30', badge: 'bg-orange-500 text-white' },
};

const LeaderboardPodium = ({ topThree }) => {
  const navigate = useNavigate();
  const orderedUsers = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 sm:p-6 bg-white dark:bg-white/[0.02]">
      <div className="flex items-end justify-center gap-3 px-2 sm:gap-6">
        {orderedUsers.map((user) => {
          const rank = user.rank || 3;
          const style = RANK_STYLES[rank] || RANK_STYLES[3];
          const isFirst = rank === 1;
          const heightClass = isFirst ? 'h-40 sm:h-48' : rank === 2 ? 'h-32 sm:h-40' : 'h-24 sm:h-32';

          return (
            <div
              key={user._id}
              onClick={() => navigate(`/profile/${user._id}`)}
              className="group flex w-28 cursor-pointer flex-col items-center transition hover:-translate-y-1 sm:w-40"
            >
              <div className="relative mb-4 flex flex-col items-center">
                <div className={`absolute -top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}>
                  #{rank}
                </div>
                <div className={`relative rounded-full border-2 bg-gradient-to-br p-1 ${style.shell} ${style.border} ${isFirst ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-20 w-20 sm:h-24 sm:w-24'}`}>
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white dark:border-gray-950 dark:bg-gray-950">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className={`font-black text-gray-900 dark:text-white ${isFirst ? 'text-4xl' : 'text-3xl'}`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className={`flex w-full flex-col items-center rounded-t-3xl border-t-2 border-l-2 border-r-2 bg-gradient-to-b pt-4 sm:pt-6 ${heightClass} ${style.shell} ${style.border}`}>
                <p className="w-full truncate px-2 text-center text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                  {user.name}
                </p>
                <div className="mt-2 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-bold text-gray-900 dark:border-white/10 dark:bg-black/20 dark:text-white sm:text-sm">
                  <FaStar className="text-yellow-500 dark:text-yellow-400" />
                  <span>{(user.xp ?? user.points)?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaderboardPodium;
