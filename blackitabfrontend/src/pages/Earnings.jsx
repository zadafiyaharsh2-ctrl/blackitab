import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaArrowUp, FaArrowDown, FaHistory, FaDownload, FaUniversity, FaMoneyBillWave } from 'react-icons/fa';

const Earnings = () => {
  // Dummy Data for UI
  const [timeRange, setTimeRange] = useState('This Month');
  const transactions = [
    { id: 1, type: 'credit', source: 'Course Sale: React Mastery', date: '2025-12-22', amount: 45.00, status: 'Completed' },
    { id: 2, type: 'credit', source: 'Monthly Subscription', date: '2025-12-21', amount: 1200.00, status: 'Completed' },
    { id: 3, type: 'debit', source: 'Withdrawal to Bank ****4567', date: '2025-12-18', amount: -2500.00, status: 'Processing' },
    { id: 4, type: 'credit', source: 'Course Sale: Advanced Node.js', date: '2025-12-15', amount: 60.00, status: 'Completed' },
    { id: 5, type: 'credit', source: 'Tip from User', date: '2025-12-12', amount: 5.00, status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-white p-6 md:p-8 pt-24 font-sans selection:bg-green-500/30">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">dummy data of Earnings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your revenue and payouts</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-[#1a1a1a] hover:bg-[#252525] text-gray-900 dark:text-white px-5 py-2.5 rounded-full font-medium transition-colors border border-gray-300 dark:border-white/10 flex items-center gap-2">
                <FaHistory size={14} /> History
            </button>
            <button className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <FaUniversity /> Withdraw
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Balance Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-green-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                    <FaWallet />
                </div>
                <span className="font-medium text-sm">Available Balance</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$1,240.50</div>
            <div className="text-sm text-green-400 flex items-center gap-1">
                <FaArrowUp size={10} /> +12.5% <span className="text-gray-500 ml-1">from last month</span>
            </div>
        </motion.div>

        {/* Total Earnings Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <FaMoneyBillWave />
                </div>
                <span className="font-medium text-sm">Total Revenue</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$14,850.00</div>
             <div className="text-sm text-gray-500">
                Lifetime earnings
            </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-300 dark:border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-yellow-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                    <FaHistory />
                </div>
                <span className="font-medium text-sm">Pending Clearance</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$320.00</div>
             <div className="text-sm text-gray-500">
                Available on Dec 25
            </div>
        </motion.div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Transactions List (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Transactions</h2>
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                    <FaDownload size={12} /> Export CSV
                </button>
            </div>

            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
                {transactions.map((tx, i) => (
                    <div key={tx.id} className={`p-4 flex items-center justify-between hover:bg-gray-100 dark:bg-white/5 transition-colors ${i !== transactions.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                tx.type === 'credit' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                            }`}>
                                {tx.type === 'credit' ? <FaArrowDown className="rotate-45" size={12} /> : <FaArrowUp className="rotate-45" size={12} />}
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 dark:text-white">{tx.source}</div>
                                <div className="text-xs text-gray-500">{tx.date} • {tx.status}</div>
                            </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                            {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </div>
                    </div>
                ))}
                <button className="w-full py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-white/5 transition-colors">
                    View All Transactions
                </button>
            </div>
        </div>

        {/* RIGHT: Analysis/Chart Placeholder */}
        <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-bold">Analytics</h2>
            
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-200">Income Sources</h3>
                    <select className="bg-white/10 border border-gray-300 dark:border-white/10 rounded-lg text-xs px-2 py-1 outline-none text-gray-600 dark:text-gray-400">
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                </div>

                {/* Mock Progress Bars */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Course Sales</span>
                            <span className="text-gray-900 dark:text-white font-medium">65%</span>
                        </div>
                        <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Subscriptions</span>
                            <span className="text-gray-900 dark:text-white font-medium">25%</span>
                        </div>
                        <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[25%] rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Tips / Donations</span>
                            <span className="text-gray-900 dark:text-white font-medium">10%</span>
                        </div>
                        <div className="h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[10%] rounded-full"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/5">
                    <h3 className="font-bold text-gray-200 mb-2">Payout Method</h3>
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <FaUniversity className="text-gray-600 dark:text-gray-400" />
                            <div className="text-sm">
                                <div className="text-gray-900 dark:text-white">Chase Bank</div>
                                <div className="text-xs text-gray-500">**** 4567</div>
                            </div>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Earnings;
