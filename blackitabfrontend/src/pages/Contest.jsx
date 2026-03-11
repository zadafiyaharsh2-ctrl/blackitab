import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaChartLine, FaCode, FaGlobe, FaMedal, FaShieldAlt, FaRocket, FaClock, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) { setTimeLeft('Started!'); return; }
      const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

const diffBadge = {
  Beginner: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Intermediate: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
  Advanced: 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20',
};

const tiers = [
  { name: 'Grandmaster', range: '2400+', cls: 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20' },
  { name: 'Master', range: '2100-2399', cls: 'text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' },
  { name: 'Expert', range: '1900-2099', cls: 'text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20' },
  { name: 'Specialist', range: '1600-1899', cls: 'text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20' },
  { name: 'Pupil', range: '1400-1599', cls: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' },
  { name: 'Newbie', range: '0-1399', cls: 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10' },
];

function ContestCard({ contest, type }) {
  const navigate = useNavigate();
  const countdown = useCountdown(type === 'upcoming' ? contest.startTime : null);
  const start = new Date(contest.startTime), end = new Date(contest.endTime);
  const durationH = Math.round((end - start) / 3600000);
  const difficulty = contest.difficultyLevel || 'Intermediate';
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{contest.title}</h3>
          {contest.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{contest.description}</p>}
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${diffBadge[difficulty] || diffBadge.Intermediate}`}>{difficulty}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: <FaClock />, value: `${durationH}h`, label: 'Duration' },
          { icon: <FaCode />, value: contest.questions?.length || 0, label: 'Questions' },
          { icon: <FaCalendarAlt />, value: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), label: 'Date' },
        ].map((m, i) => (
          <div key={i} className="border border-gray-100 dark:border-white/5 rounded-lg py-2">
            <div className="text-gray-400 text-xs flex justify-center mb-1">{m.icon}</div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">{m.value}</p>
            <p className="text-[10px] text-gray-400">{m.label}</p>
          </div>
        ))}
      </div>
      {type === 'upcoming' && countdown && (
        <div className="text-center py-1.5 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 text-xs text-blue-600 dark:text-blue-400">
          Starts in <strong>{countdown}</strong>
        </div>
      )}
      <button
        onClick={() => navigate(type === 'past' ? '/leaderboard' : '/problems')}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold ${type === 'upcoming' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
      >
        {type === 'upcoming' ? 'Register & Practice' : 'View Leaderboard'}
      </button>
    </div>
  );
}

const Contest = () => {
  usePageTitle('Contests');
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/contests?status=${tab}&limit=20`);
        setContests(res.data.success ? res.data.data : []);
      } catch { setContests([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [tab]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaTrophy className="text-amber-400" /> Contest Arena
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Join competitive rounds, benchmark your performance, and improve consistently.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-white/10">
        {['upcoming', 'active', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 capitalize -mb-px transition-colors ${tab === t ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t}</button>
        ))}
      </div>

      {/* Contests */}
      {loading ? (
        <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400 text-xl" /></div>
      ) : contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map(c => <ContestCard key={c._id} contest={c} type={tab} />)}
        </div>
      ) : (
        <div className="border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-16 text-center text-gray-400">
          <FaTrophy className="text-3xl mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-700 dark:text-gray-300">No {tab} contests</p>
          {tab === 'upcoming' && <p className="text-sm mt-1">Check back soon — new contests are scheduled regularly.</p>}
        </div>
      )}

      {/* Why Compete */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Why Compete?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: <FaGlobe />, title: 'Global Arena', desc: 'Compete with developers worldwide in scheduled coding rounds.' },
            { icon: <FaChartLine />, title: 'ELO Rating', desc: 'Track growth through a consistent rating system.' },
            { icon: <FaTrophy />, title: 'Weekly Challenges', desc: 'Join recurring events from beginner to advanced level.' },
            { icon: <FaCode />, title: 'Post-Contest Analysis', desc: 'Review performance and identify what to improve next.' },
          ].map((f, i) => (
            <div key={i} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] text-center">
              <div className="text-gray-400 text-lg mb-2 flex justify-center">{f.icon}</div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Tiers */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <FaShieldAlt /> Rating Tiers
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {tiers.map(t => (
            <div key={t.name} className={`border rounded-lg p-3 text-center ${t.cls}`}>
              <FaMedal className="mx-auto mb-1 text-sm" />
              <p className="text-xs font-semibold">{t.name}</p>
              <p className="text-[10px] opacity-70">{t.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border border-gray-200 dark:border-white/10 rounded-xl p-8 bg-white dark:bg-white/[0.02] text-center">
        <FaRocket className="text-2xl text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to Compete?</h3>
        <p className="text-sm text-gray-500 mb-4">Sharpen your skills with practice sets and prepare for your next contest round.</p>
        <button onClick={() => navigate('/problems')} className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">
          Start Practicing
        </button>
      </div>
    </div>
  );
};

export default Contest;
