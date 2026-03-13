import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar, FaArrowLeft } from 'react-icons/fa';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';

const RANK_STYLES = {
  1: {
    shell: 'from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-400/5',
    border: 'border-amber-300 dark:border-amber-400/30',
    badge: 'bg-amber-500 text-white'
  },
  2: {
    shell: 'from-slate-100 to-slate-50 dark:from-slate-500/20 dark:to-slate-400/5',
    border: 'border-slate-300 dark:border-slate-400/30',
    badge: 'bg-slate-500 text-white'
  },
  3: {
    shell: 'from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-400/5',
    border: 'border-orange-300 dark:border-orange-400/30',
    badge: 'bg-orange-500 text-white'
  }
};

const Leaderboard = () => {
  usePageTitle('Leaderboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUserId(user._id || user.id);
      } catch {}
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.data?.length > 0) {
        setUsers(res.data.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="relative rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <FaArrowLeft />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <FaTrophy className="text-3xl" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Leaderboard
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              See who is leading by consistency, accuracy, and total XP.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-white/[0.04] dark:text-gray-500">
              <FaTrophy className="text-3xl" />
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">No rankings yet</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Be the first to complete problems and claim the top spot.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-center gap-3 px-2 sm:gap-6">
              {[topThree[1], topThree[0], topThree[2]].filter(Boolean).map((user) => {
                const style = RANK_STYLES[user.rank] || RANK_STYLES[3];
                const isFirst = user.rank === 1;
                const heightClass = isFirst ? 'h-40 sm:h-48' : user.rank === 2 ? 'h-32 sm:h-40' : 'h-24 sm:h-32';

                return (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="group flex w-28 cursor-pointer flex-col items-center transition hover:-translate-y-1 sm:w-40"
                  >
                    <div className="relative mb-4 flex flex-col items-center">
                      <div className={`absolute -top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${style.badge}`}>
                        #{user.rank}
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

            <div className="flex flex-col gap-3 sm:gap-4">
              {rest.map((user) => {
                const isSelf = user._id === currentUserId;

                return (
                  <div
                    key={user._id}
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className={`group relative flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition hover:-translate-y-1 sm:flex-row sm:items-center sm:p-5 ${
                      isSelf
                        ? 'border-blue-200 bg-blue-50 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/10'
                        : 'border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex w-full items-center gap-4 sm:w-auto">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-base font-black text-gray-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:h-12 sm:w-12 sm:text-lg">
                        #{user.rank}
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white dark:border-white/20 dark:bg-gray-950 sm:h-14 sm:w-14">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`flex items-center gap-2 truncate text-base font-bold sm:text-lg ${isSelf ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {user.name}
                          {isSelf && (
                            <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">
                              You
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 truncate text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 sm:text-sm">
                          <span className="flex items-center gap-1">
                            <FaFire className="text-xs text-orange-500" /> {user.stats?.problemsSolved || 0} Solved
                          </span>
                          <span>•</span>
                          <span className={user.stats?.accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                            {user.stats?.accuracy || 0}% Accuracy
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex w-full items-center gap-3 pl-16 sm:mt-0 sm:w-auto sm:gap-6 sm:pl-0">
                      {user.streak > 0 && (
                        <div className="flex min-w-[70px] flex-row items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 sm:flex-col sm:justify-center sm:gap-0 sm:px-4 sm:py-2 dark:border-orange-500/20 dark:bg-orange-500/10">
                          <div className="flex items-center gap-1.5">
                            <FaFire className="text-sm text-orange-500 dark:text-orange-400 sm:text-base" />
                            <span className="text-sm font-black text-orange-600 dark:text-orange-400 sm:text-base">{user.streak}</span>
                          </div>
                          <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-widest text-orange-600/70 dark:text-orange-400/70 sm:block">
                            Streak
                          </span>
                        </div>
                      )}

                      <div className="ml-auto flex min-w-[100px] flex-row items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 sm:ml-0 sm:flex-col sm:items-end sm:gap-0 sm:px-4 sm:py-2 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="flex items-center gap-1.5">
                          <FaStar className="text-sm text-yellow-500 dark:text-yellow-400 sm:text-base" />
                          <span className="text-sm font-black text-gray-900 dark:text-white sm:text-base">
                            {(user.xp ?? user.points)?.toLocaleString() || 0}
                          </span>
                        </div>
                        <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 sm:block">
                          Total XP
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
