import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaArrowUp, FaArrowDown, FaHistory, FaDownload, FaMoneyBillWave, FaFilter, FaChartLine } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const TYPE_LABELS = {
  content_view: { label: 'Content View', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  referral: { label: 'Referral Bonus', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  contest_prize: { label: 'Contest Prize', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  teaching_bonus: { label: 'Teaching Bonus', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  withdrawal: { label: 'Withdrawal', color: 'text-red-400', bg: 'bg-red-500/10' },
  bonus: { label: 'Bonus', color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

const Earnings = () => {
  usePageTitle('Earnings');
  const [stats, setStats] = useState({ totalEarned: 0, totalWithdrawn: 0, availableBalance: 0, totalTransactions: 0 });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchSummary(); }, []);
  useEffect(() => { fetchTransactions(); }, [page, filterType]);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/earnings`, { headers });
      if (res.data.success) {
        setStats(res.data.data.stats);
        setMonthlyBreakdown(res.data.data.monthlyBreakdown || []);
      }
    } catch { }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const url = `${API_URL}/api/earnings/transactions?page=${page}&limit=15${filterType ? `&type=${filterType}` : ''}`;
      const res = await axios.get(url, { headers });
      if (res.data.success) {
        setTransactions(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch { }
    setTxLoading(false);
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) { CustomToast.error('Enter a valid amount'); return; }
    try {
      const res = await axios.post(`${API_URL}/api/earnings/withdraw`, { amount: amt }, { headers });
      if (res.data.success) {
        CustomToast.success(res.data.message);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        fetchSummary();
        fetchTransactions();
      }
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/earnings/export`, { headers, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blackitab_earnings.csv';
      a.click();
      URL.revokeObjectURL(url);
      CustomToast.success('CSV downloaded');
    } catch {
      CustomToast.error('Export failed');
    }
  };

  const statCards = [
    { label: 'Total Earned', value: `₹${stats.totalEarned?.toLocaleString() || '0'}`, icon: FaArrowUp, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
    { label: 'Withdrawn', value: `₹${stats.totalWithdrawn?.toLocaleString() || '0'}`, icon: FaArrowDown, color: 'text-red-400', bg: 'from-red-500/20 to-orange-500/20' },
    { label: 'Available', value: `₹${stats.availableBalance?.toLocaleString() || '0'}`, icon: FaWallet, color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/20' },
    { label: 'Transactions', value: stats.totalTransactions || 0, icon: FaHistory, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' },
  ];

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-10, 10, -10], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
      </div>

      <motion.div className="relative z-10 max-w-6xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">My </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Earnings</span>
            </h1>
            <p className="text-gray-400 mt-1">Track your income and manage withdrawals</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-bold hover:bg-white/10 transition-colors">
              <FaDownload /> Export CSV
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm shadow-lg shadow-emerald-500/30">
              <FaMoneyBillWave /> Withdraw
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className="glass-panel p-5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : s.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${s.bg} border border-white/5`}>
                <s.icon className={`text-xl ${s.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Monthly Chart */}
        {monthlyBreakdown.length > 0 && (
          <motion.div variants={itemVariants} className="glass-panel p-6 border border-white/10 rounded-2xl mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FaChartLine className="text-blue-400" /> Monthly Earnings</h3>
            <div className="flex items-end gap-2 h-32">
              {monthlyBreakdown.reverse().map((m, i) => {
                const maxVal = Math.max(...monthlyBreakdown.map(x => x.total), 1);
                const height = Math.max((m.total / maxVal) * 100, 8);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500">₹{m.total}</span>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg" />
                    <span className="text-[10px] text-gray-600">{m._id?.split('-')[1]}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Transactions */}
        <motion.div variants={itemVariants} className="glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaHistory className="text-purple-400" /> Transactions</h3>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500 text-xs" />
              <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 outline-none">
                <option value="" className="bg-gray-900">All Types</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-gray-900">{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {txLoading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-white/5">
              {transactions.map((tx, i) => {
                const meta = TYPE_LABELS[tx.type] || { label: tx.type, color: 'text-gray-400', bg: 'bg-gray-500/10' };
                const isPositive = tx.amount >= 0;
                return (
                  <div key={tx._id || i} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${meta.bg}`}>
                        {isPositive ? <FaArrowUp className={meta.color} /> : <FaArrowDown className="text-red-400" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{meta.label}</p>
                        <p className="text-gray-500 text-xs">{tx.description || new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <p className={`text-[10px] font-bold uppercase ${
                        tx.status === 'completed' ? 'text-emerald-500' :
                        tx.status === 'pending' ? 'text-yellow-500' :
                        'text-gray-500'
                      }`}>{tx.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <FaWallet className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="font-medium">No transactions yet</p>
              <p className="text-xs mt-1">Earnings from content views, contests, and referrals will appear here</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${p === page ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>{p}</button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-8 rounded-[2rem] border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Request Withdrawal</h3>
            <p className="text-gray-400 text-sm mb-6">Available balance: <span className="text-emerald-400 font-bold">₹{stats.availableBalance?.toLocaleString()}</span></p>
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount in ₹" min="1" max={stats.availableBalance}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/50 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handleWithdraw}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-lg shadow-emerald-500/30">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
