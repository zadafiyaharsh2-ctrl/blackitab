import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaFire, FaStar } from 'react-icons/fa';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';
import LeaderboardPodium from '../../components/student/pages/leaderboard/LeaderboardPodium';

const Leaderboard = () => {
  usePageTitle('Leaderboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) { try { const user = JSON.parse(stored); setCurrentUserId(user._id || user.id); } catch { setCurrentUserId(null); } }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success && res.data.data?.length > 0) setUsers(res.data.data);
      else setUsers([]);
    } catch (err) { console.error('Leaderboard error:', err); setUsers([]); }
    finally { setLoading(false); }
  };

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);
  const topUser = users[0];
  const currentUserEntry = users.find((u) => String(u._id) === String(currentUserId));
  const topXp = topUser ? (topUser.xp ?? topUser.points ?? 0) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaTrophy className="text-amber-400" /> Leaderboard
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 sm:p-6 bg-white dark:bg-white/[0.02]">
        <p className="text-sm text-gray-500 dark:text-gray-400">See who is leading by consistency, accuracy, and total XP.</p>
        {!loading && users.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Top Scorer', value: topUser?.name || 'N/A' },
              { label: 'Your Rank', value: currentUserEntry ? `#${currentUserEntry.rank}` : 'Unranked' },
              { label: 'Highest XP', value: topXp.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="border border-gray-200 dark:border-white/10 rounded-lg p-3.5 bg-gray-50 dark:bg-white/[0.03]">
                <div className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">{label}</div>
                <div className="mt-1 text-base font-bold text-gray-900 dark:text-white truncate">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-16 text-center text-gray-400 bg-white dark:bg-white/[0.02]">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-white/[0.04] dark:text-gray-500">
            <FaTrophy className="text-3xl" />
          </div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">No rankings yet</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Be the first to complete problems and claim the top spot.</p>
        </div>
      ) : (
        <>
          <LeaderboardPodium topThree={topThree} />

          {/* Remaining Users Table */}
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-3 sm:p-4 bg-white dark:bg-white/[0.02]">
            {rest.length > 0 ? (
              <div className="flex flex-col gap-3 sm:gap-4">
                {rest.map((user) => {
                  const isSelf = String(user._id) === String(currentUserId);
                  return (
                    <div key={user._id} onClick={() => navigate(`/profile/${user._id}`)}
                      className={`group relative flex cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition hover:-translate-y-1 sm:flex-row sm:items-center sm:p-5 ${
                        isSelf ? 'border-blue-200 bg-blue-50 shadow-sm dark:border-blue-400/30 dark:bg-blue-500/10' : 'border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex w-full items-center gap-4 sm:w-auto">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-base font-black text-gray-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:h-12 sm:w-12 sm:text-lg">#{user.rank}</div>
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-white dark:border-white/20 dark:bg-gray-950 sm:h-14 sm:w-14">
                          {user.profileImage ? <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" /> : <span className="text-lg font-bold text-gray-700 dark:text-gray-300">{user.name?.charAt(0).toUpperCase()}</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`flex items-center gap-2 truncate text-base font-bold sm:text-lg ${isSelf ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            {user.name}
                            {isSelf && <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">You</span>}
                          </p>
                          <p className="mt-0.5 flex items-center gap-2 truncate text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400 sm:text-sm">
                            <span className="flex items-center gap-1"><FaFire className="text-xs text-orange-500" /> {user.stats?.problemsSolved || 0} Solved</span>
                            <span>•</span>
                            <span className={user.stats?.accuracy >= 80 ? 'text-emerald-600 dark:text-emerald-400' : ''}>{user.stats?.accuracy || 0}% Accuracy</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex w-full items-center gap-3 pl-16 sm:mt-0 sm:w-auto sm:gap-6 sm:pl-0">
                        {user.streak > 0 && (
                          <div className="flex min-w-[70px] flex-row items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 sm:flex-col sm:justify-center sm:gap-0 sm:px-4 sm:py-2 dark:border-orange-500/20 dark:bg-orange-500/10">
                            <div className="flex items-center gap-1.5"><FaFire className="text-sm text-orange-500 dark:text-orange-400 sm:text-base" /><span className="text-sm font-black text-orange-600 dark:text-orange-400 sm:text-base">{user.streak}</span></div>
                            <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-widest text-orange-600/70 dark:text-orange-400/70 sm:block">Streak</span>
                          </div>
                        )}
                        <div className="ml-auto flex min-w-[100px] flex-row items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 sm:ml-0 sm:flex-col sm:items-end sm:gap-0 sm:px-4 sm:py-2 dark:border-white/10 dark:bg-white/[0.04]">
                          <div className="flex items-center gap-1.5"><FaStar className="text-sm text-yellow-500 dark:text-yellow-400 sm:text-base" /><span className="text-sm font-black text-gray-900 dark:text-white sm:text-base">{(user.xp ?? user.points)?.toLocaleString() || 0}</span></div>
                          <span className="mt-0.5 hidden text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 sm:block">Total XP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">Only top performers are available right now.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;
