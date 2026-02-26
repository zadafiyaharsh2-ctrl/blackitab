import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlusCircle, FaListAlt, FaChartBar, FaUsers, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

const TeacherDashboard = () => {
  usePageTitle('Teacher Dashboard');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ questionsCreated: 0, studentsCount: 0, avgAccuracy: 0 });
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));

        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch teacher's questions
        const qRes = await axios.get(`${API_URL}/api/exams/questions/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (qRes.data.success) {
          setRecentQuestions(qRes.data.data.slice(0, 5));
          setStats(prev => ({ ...prev, questionsCreated: qRes.data.data.length }));
        }

        // Fetch school analytics for student count
        const aRes = await axios.get(`${API_URL}/api/analytics/school`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aRes.data.success) {
          setStats(prev => ({
            ...prev,
            studentsCount: aRes.data.data.totalStudents || 0,
          }));
        }
      } catch (err) {
        console.error('Teacher dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: 'Create Question', desc: 'Add a new exam question', icon: FaPlusCircle, link: '/create-question', color: 'from-emerald-500 to-teal-500' },
    { title: 'My Questions', desc: 'View & manage questions', icon: FaListAlt, link: '/my-questions', color: 'from-blue-500 to-indigo-500' },
    { title: 'School Analytics', desc: 'Student performance data', icon: FaChartBar, link: '/school-analytics', color: 'from-purple-500 to-pink-500' },
    { title: 'Student List', desc: 'View your students', icon: FaUsers, link: '/school-analytics', color: 'from-orange-500 to-red-500' },
  ];

  const statCards = [
    { title: 'Questions Created', value: stats.questionsCreated, icon: FaListAlt, color: 'text-blue-400', bg: 'from-blue-500/20 to-indigo-500/20' },
    { title: 'Students', value: stats.studentsCount, icon: FaUsers, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20' },
    { title: 'Avg. Accuracy', value: `${stats.avgAccuracy}%`, icon: FaCheckCircle, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20' },
  ];

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-20, 20, -20], y: [-20, 20, -20], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <motion.div className="relative z-10 max-w-7xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Teacher </span>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-400 text-lg">Welcome back, {user?.name || 'Teacher'}. Manage your classes and content.</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10">
          {statCards.map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5, scale: 1.02 }}
              className="glass-panel p-6 flex items-center justify-between group border border-white/5">
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white">{loading ? '...' : stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/5`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link to={action.link}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all group text-center">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                    <action.icon className="text-2xl text-white" />
                  </div>
                  <span className="font-bold text-gray-200 group-hover:text-white">{action.title}</span>
                  <span className="text-xs text-gray-500">{action.desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Questions */}
        <motion.div variants={itemVariants} className="glass-panel p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Questions</h2>
            <Link to="/my-questions" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </div>
          {recentQuestions.length > 0 ? (
            <div className="space-y-3">
              {recentQuestions.map((q, i) => (
                <div key={q._id || i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{q.question}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{q.subject}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                        q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>{q.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaListAlt className="text-4xl mx-auto mb-3 opacity-30" />
              <p className="font-medium">No questions created yet</p>
              <Link to="/create-question" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300">
                Create your first question →
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
