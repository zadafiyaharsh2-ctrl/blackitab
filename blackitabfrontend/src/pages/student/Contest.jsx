import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';
import { ContestCard, ContestInfoSections } from '../../components/student/pages/contest/ContestComponents';

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

      {/* Contests Grid */}
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

      <ContestInfoSections />
    </div>
  );
};

export default Contest;
