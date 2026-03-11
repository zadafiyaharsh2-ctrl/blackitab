import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FaChalkboardTeacher, FaUsers, FaClipboardList, FaCalendarAlt,
  FaStar, FaCommentDots, FaChartLine, FaSpinner, FaPlusCircle,
  FaFileAlt, FaGraduationCap, FaAward, FaCalendarDay
} from 'react-icons/fa';
import API from '../../config';

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <FaSpinner className="animate-spin text-2xl text-gray-400" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-red-400 text-sm">{error}</p>
      <button onClick={fetchDashboard} className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm">Retry</button>
    </div>
  );

  const d = dashboard || {};
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'ratings', label: 'Ratings' },
    { key: 'actions', label: 'Quick Actions' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FaChalkboardTeacher className="text-gray-400" />
            Teacher Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, <span className="font-semibold text-gray-700 dark:text-gray-300">{user.name || 'Teacher'}</span>
            {d.specialization && <span className="text-gray-400"> · {d.specialization}</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/question-management" className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5">
            <FaPlusCircle className="text-xs" /> Question Bank
          </Link>
          <Link to="/school-analytics" className="px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-1.5">
            <FaChartLine className="text-xs" /> Analytics
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'My Batches', value: d.batchCount || 0, icon: <FaUsers /> },
          { label: 'Questions', value: d.questionCount || 0, icon: <FaClipboardList />, link: '/question-management' },
          { label: 'Assignments', value: d.assignmentCount || 0, icon: <FaFileAlt /> },
          { label: 'Exams', value: d.examCount || 0, icon: <FaCalendarAlt /> },
        ].map((card, i) => {
          const Wrapper = card.link ? Link : 'div';
          const wrapperProps = card.link ? { to: card.link } : {};
          return (
            <Wrapper key={i} {...wrapperProps}>
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-default">
                <p className="text-gray-400 text-sm mb-2">{card.icon}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaStar className="text-amber-400" /> Student Ratings
            </h3>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-500">{d.studentRating?.average || 0}</div>
                <div className="text-xs text-gray-400 mt-1">out of 5.0</div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Reviews</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{d.studentRating?.totalReviews || 0}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${((d.studentRating?.average || 0) / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaGraduationCap className="text-gray-400" /> Your Info
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Role</span>
                <span className="font-medium text-gray-900 dark:text-white text-xs px-2 py-1 border border-gray-200 dark:border-white/10 rounded-full">
                  {d.role === 'hod' ? 'Head of Dept' : d.role === 'institute_admin' ? 'Institute Admin' : 'Teacher'}
                </span>
              </div>
              {d.specialization && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Specialization</span>
                  <span className="font-medium text-gray-900 dark:text-white">{d.specialization}</span>
                </div>
              )}
              {d.teacherSince && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Teaching Since</span>
                  <span className="font-medium text-gray-900 dark:text-white">{new Date(d.teacherSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {d.instituteScores?.length > 0 && (
            <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] lg:col-span-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FaAward className="text-gray-400" /> Institute Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {d.instituteScores.map((s, i) => (
                  <div key={i} className="border border-gray-200 dark:border-white/10 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{s.score}<span className="text-xs text-gray-400">/100</span></p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{s.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ratings */}
      {activeTab === 'ratings' && (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <FaCommentDots className="text-gray-400" /> Student Feedback
          </h3>
          <p className="text-sm text-gray-500">Feedback will appear here once students start rating your content.</p>
          <Link to="/school-analytics" className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
            View detailed analytics →
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Manage Batches', desc: 'Create and view student groups', icon: <FaUsers />, link: '/teacher/batches' },
            { label: 'Take Attendance', desc: 'Mark daily attendance', icon: <FaCalendarDay />, link: '/teacher/attendance' },
            { label: 'Question Bank', desc: 'Manage & generate questions', icon: <FaClipboardList />, link: '/question-management' },
            { label: 'Question Paper', desc: 'Export questions as PDF', icon: <FaFileAlt />, link: '/question-paper' },
            { label: 'School Analytics', desc: 'Monitor student performance', icon: <FaChartLine />, link: '/school-analytics' },
          ].map((action, i) => (
            <Link key={i} to={action.link}>
              <div className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] group">
                <p className="text-gray-400 text-lg mb-2">{action.icon}</p>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
