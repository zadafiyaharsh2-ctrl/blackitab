import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaTrophy, FaChartLine, FaCode, FaGlobe, FaMedal, FaShieldAlt,
  FaRocket, FaClock, FaCalendarAlt
} from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) {
        setTimeLeft('Started!');
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };

    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

const difficultyClasses = {
  Beginner: 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  Intermediate: 'text-amber-700 bg-amber-100 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30',
  Advanced: 'text-rose-700 bg-rose-100 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30',
};

const featureCards = [
  {
    icon: FaGlobe,
    title: 'Global Arena',
    description: 'Compete with developers worldwide in scheduled coding rounds.',
    iconClass: 'text-blue-700 dark:text-blue-300',
    iconBg: 'bg-blue-100 dark:bg-blue-500/10'
  },
  {
    icon: FaChartLine,
    title: 'ELO Rating',
    description: 'Track growth through a consistent rating system.',
    iconClass: 'text-cyan-700 dark:text-cyan-300',
    iconBg: 'bg-cyan-100 dark:bg-cyan-500/10'
  },
  {
    icon: FaTrophy,
    title: 'Weekly Challenges',
    description: 'Join recurring events from beginner to advanced level.',
    iconClass: 'text-indigo-700 dark:text-indigo-300',
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/10'
  },
  {
    icon: FaCode,
    title: 'Post-Contest Analysis',
    description: 'Review performance and identify what to improve next.',
    iconClass: 'text-slate-700 dark:text-slate-300',
    iconBg: 'bg-slate-200 dark:bg-slate-700/60'
  },
];

const ratingTiers = [
  { name: 'Grandmaster', range: '2400+', className: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30' },
  { name: 'Master', range: '2100-2399', className: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30' },
  { name: 'Expert', range: '1900-2099', className: 'text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/30' },
  { name: 'Specialist', range: '1600-1899', className: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30' },
  { name: 'Pupil', range: '1400-1599', className: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' },
  { name: 'Newbie', range: '0-1399', className: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600' },
];

function ContestCard({ contest, type }) {
  const navigate = useNavigate();
  const countdown = useCountdown(type === 'upcoming' ? contest.startTime : null);
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const durationH = Math.round((end - start) / 3600000);
  const qCount = contest.questions?.length || 0;
  const difficulty = contest.difficultyLevel || 'Intermediate';
  const difficultyClass = difficultyClasses[difficulty] || difficultyClasses.Intermediate;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="glass-panel p-6 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{contest.title}</h3>
          {contest.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{contest.description}</p>
          )}
        </div>
        <span className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border ${difficultyClass}`}>
          {difficulty}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-center">
          <FaClock className="text-blue-600 dark:text-blue-300 mx-auto mb-1 text-sm" />
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{durationH}h</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Duration</p>
        </div>
        <div className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-center">
          <FaCode className="text-cyan-600 dark:text-cyan-300 mx-auto mb-1 text-sm" />
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{qCount}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Questions</p>
        </div>
        <div className="rounded-xl p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-center">
          <FaCalendarAlt className="text-indigo-600 dark:text-indigo-300 mx-auto mb-1 text-sm" />
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</p>
        </div>
      </div>

      {type === 'upcoming' && countdown && (
        <div className="mb-4 text-center py-2 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Starts in: </span>
          <span className="text-xs font-mono font-bold text-blue-800 dark:text-blue-200">{countdown}</span>
        </div>
      )}

      <button
        onClick={() => navigate(type === 'past' ? '/leaderboard' : '/problems')}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
          type === 'upcoming'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'
        }`}
      >
        {type === 'upcoming' ? 'Register & Practice' : 'View Leaderboard'}
      </button>
    </motion.div>
  );
}

const Contest = () => {
  usePageTitle('Contests');

  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/contests?status=${tab}&limit=20`);
        if (res.data.success) {
          setContests(res.data.data);
        } else {
          setContests([]);
        }
      } catch {
        setContests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [tab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-20">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto space-y-8">
        <motion.section variants={itemVariants} className="glass-panel p-8 md:p-10 border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <FaTrophy className="text-3xl text-blue-700 dark:text-blue-300" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Contest Arena</h1>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                Join competitive rounds, benchmark your performance, and improve consistently.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="flex justify-center gap-2">
          {['upcoming', 'active', 'past'].map((value) => {
            const active = tab === value;
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {value}
              </button>
            );
          })}
        </motion.section>

        <motion.section variants={itemVariants}>
          {loading ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              Loading contests...
            </div>
          ) : contests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.map((contest) => (
                <ContestCard key={contest._id} contest={contest} type={tab} />
              ))}
            </div>
          ) : (
            <div className="glass-panel border border-slate-200 dark:border-slate-700 text-center py-16">
              <FaTrophy className="text-4xl text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No {tab} contests</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {tab === 'upcoming' ? 'Check back soon - new contests are scheduled regularly.' : 'All caught up.'}
              </p>
            </div>
          )}
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">Why Compete?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="glass-panel p-5 border border-slate-200 dark:border-slate-700 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${feature.iconBg}`}>
                    <Icon className={`text-xl ${feature.iconClass}`} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="glass-panel p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <FaShieldAlt className="text-blue-700 dark:text-blue-300" />
            Rating Tiers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {ratingTiers.map((tier) => (
              <div key={tier.name} className={`rounded-xl border p-4 text-center ${tier.className}`}>
                <FaMedal className="mx-auto mb-1" />
                <p className="text-sm font-semibold">{tier.name}</p>
                <p className="text-[11px] opacity-80">{tier.range}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="glass-panel p-8 md:p-12 border border-slate-200 dark:border-slate-700 text-center">
          <FaRocket className="text-4xl text-blue-700 dark:text-blue-300 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">Ready to Compete?</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-7">
            Sharpen your skills with practice sets and prepare for your next contest round.
          </p>
          <button
            onClick={() => navigate('/problems')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Start Practicing Now
          </button>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Contest;
