import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
  FaStar, FaBookOpen, FaBullhorn, FaCommentDots,
  FaChartLine, FaSpinner, FaPlusCircle, FaFileAlt,
  FaGraduationCap, FaAward, FaUserGraduate, FaCalendarDay
} from 'react-icons/fa';

import API from '../config';

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/teacher/dashboard`, { headers });
      setDashboard(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button onClick={fetchDashboard} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Retry
        </button>
      </div>
    );
  }

  const d = dashboard || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ─── Header ─── */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FaChalkboardTeacher className="text-indigo-500" />
            Teacher Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Welcome back, <span className="font-semibold text-indigo-400">{user.name || 'Teacher'}</span>
            {d.specialization && <span className="text-gray-600 dark:text-gray-500"> · {d.specialization}</span>}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/create-question"
            className="px-4 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition text-sm flex items-center gap-2">
            <FaPlusCircle /> Create Question
          </Link>
          <Link to="/question-paper"
            className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-600/30 transition text-sm flex items-center gap-2">
            <FaFileAlt /> Question Paper
          </Link>
          <Link to="/school-analytics"
            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 transition text-sm flex items-center gap-2">
            <FaChartLine /> School Analytics
          </Link>
        </div>
      </motion.div>

      {/* ─── Summary Cards ─── */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'My Batches', value: d.batchCount || 0, icon: <FaUsers />, color: 'indigo', link: null },
          { label: 'Questions Created', value: d.questionCount || 0, icon: <FaClipboardList />, color: 'emerald', link: '/my-questions' },
          { label: 'Assignments', value: d.assignmentCount || 0, icon: <FaBookOpen />, color: 'amber', link: null },
          { label: 'Exams Scheduled', value: d.examCount || 0, icon: <FaCalendarAlt />, color: 'rose', link: null },
        ].map((card, i) => {
          const Wrapper = card.link ? Link : 'div';
          const wrapperProps = card.link ? { to: card.link } : {};
          return (
            <Wrapper key={i} {...wrapperProps}>
              <motion.div variants={fadeIn}
                className={`glass-panel rounded-xl p-5 border border-${card.color}-500/20 hover:border-${card.color}-500/40 transition cursor-pointer group`}>
                <div className={`text-${card.color}-400 text-xl mb-3 group-hover:scale-110 transition-transform`}>{card.icon}</div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium">{card.label}</p>
              </motion.div>
            </Wrapper>
          );
        })}
      </motion.div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10 pb-1">
        {[
          { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
          { key: 'ratings', label: 'Ratings & Scores', icon: <FaStar /> },
          { key: 'actions', label: 'Quick Actions', icon: <FaPlusCircle /> },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-white/10 border-b-white dark:border-b-gray-900 shadow-sm -mb-[1px]'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === 'overview' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Student Rating Summary */}
          <motion.div variants={fadeIn} className="glass-panel rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaStar className="text-amber-400" /> Student Ratings
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-5xl font-black text-amber-400">{d.studentRating?.average || 0}</div>
                <div className="text-xs text-gray-500 mt-1">out of 5.0</div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 w-20">Reviews</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{d.studentRating?.totalReviews || 0}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${((d.studentRating?.average || 0) / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Role & Info */}
          <motion.div variants={fadeIn} className="glass-panel rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-indigo-400" /> Your Info
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Role</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  d.role === 'hod' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  d.role === 'institute_admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {d.role === 'hod' ? 'Head of Department' : d.role === 'institute_admin' ? 'Institute Admin' : 'Teacher'}
                </span>
              </div>
              {d.specialization && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Specialization</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{d.specialization}</span>
                </div>
              )}
              {d.teacherSince && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Teaching Since</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{new Date(d.teacherSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Institute Scores */}
          {d.instituteScores && d.instituteScores.length > 0 && (
            <motion.div variants={fadeIn} className="glass-panel rounded-xl p-6 border border-gray-200 dark:border-white/10 lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaAward className="text-rose-400" /> Institute Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {d.instituteScores.map((s, i) => (
                  <div key={i} className="bg-gray-100 dark:bg-gray-800/60 rounded-lg p-4 text-center">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{s.score}<span className="text-sm text-gray-500">/100</span></p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{s.category}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {activeTab === 'ratings' && (
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-4">
          <div className="glass-panel rounded-xl p-6 border border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FaCommentDots className="text-blue-400" /> Recent Student Feedback
            </h3>
            <p className="text-gray-500 text-sm">Feedback from students will appear here once they start rating your content and teaching.</p>
            <Link to="/school-analytics" className="inline-block mt-4 text-sm text-blue-500 hover:text-blue-400 font-semibold">
              View detailed analytics →
            </Link>
          </div>
        </motion.div>
      )}

      {activeTab === 'actions' && (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Manage Batches', desc: 'Create and view student groups', icon: <FaUsers />, link: '/teacher/batches', color: 'blue' },
            { label: 'Take Attendance', desc: 'Mark daily attendance grid', icon: <FaCalendarDay />, link: '/teacher/attendance', color: 'indigo' },
            { label: 'Generate AI Questions', desc: 'Auto-generate questions from a topic', icon: <FaGraduationCap />, link: '/ai-questions', color: 'emerald' },
            { label: 'Create Manual Question', desc: 'Write a question by hand', icon: <FaPlusCircle />, link: '/create-question', color: 'purple' },
            { label: 'My Questions', desc: 'View and manage your questions', icon: <FaClipboardList />, link: '/my-questions', color: 'amber' },
            { label: 'Generate Question Paper', desc: 'Export questions as PDF', icon: <FaFileAlt />, link: '/question-paper', color: 'rose' },
            { label: 'School Analytics', desc: 'Monitor student performance', icon: <FaChartLine />, link: '/school-analytics', color: 'teal' },
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <motion.div variants={fadeIn} whileHover={{ y: -4 }}
                className={`glass-panel rounded-xl p-5 border border-${action.color}-500/20 hover:border-${action.color}-500/40 transition group cursor-pointer`}>
                <div className={`text-${action.color}-400 text-2xl mb-3 group-hover:scale-110 transition-transform`}>{action.icon}</div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{action.label}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{action.desc}</p>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
}
