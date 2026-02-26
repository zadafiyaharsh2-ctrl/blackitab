import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const MyQuestions = () => {
  usePageTitle('My Questions');
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/exams/questions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setQuestions(res.data.data);
    } catch (err) {
      console.error('Fetch questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/exams/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => prev.filter(q => q._id !== id));
      CustomToast.success('Question deleted');
      setDeleteConfirm(null);
    } catch (err) {
      CustomToast.error('Failed to delete question');
    }
  };

  const filtered = questions.filter(q => {
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
    if (filterSubject && q.subject !== filterSubject) return false;
    return true;
  });

  const subjects = [...new Set(questions.map(q => q.subject))];

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      <motion.div className="relative z-10 max-w-5xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">My Questions</h1>
            <p className="text-gray-400 text-sm mt-1">{questions.length} questions in your bank</p>
          </div>
          <Link to="/create-question">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm shadow-lg shadow-emerald-500/30">
              <FaPlus /> New Question
            </motion.button>
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 border border-white/10 rounded-2xl mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..." className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
            <option value="" className="bg-gray-900">All Difficulty</option>
            <option value="Easy" className="bg-gray-900">Easy</option>
            <option value="Medium" className="bg-gray-900">Medium</option>
            <option value="Hard" className="bg-gray-900">Hard</option>
          </select>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
            <option value="" className="bg-gray-900">All Subjects</option>
            {subjects.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
          </select>
        </div>

        {/* Question List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((q, i) => (
              <motion.div key={q._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-panel p-5 border border-white/10 rounded-2xl flex items-start gap-4 group hover:border-white/20 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium mb-2">{q.question}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase">{q.exam}</span>
                    <span className="text-gray-500">{q.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                      q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>{q.difficulty}</span>
                    {q.tags?.length > 0 && q.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white/5 text-gray-500 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <FaEdit />
                  </button>
                  {deleteConfirm === q._id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDelete(q._id)} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg font-bold">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 bg-white/10 text-gray-300 text-xs rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(q._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel border border-white/10 rounded-2xl">
            <FaFilter className="text-4xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{questions.length > 0 ? 'No questions match your filters' : 'No questions yet'}</p>
            {questions.length === 0 && (
              <Link to="/create-question" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300">
                Create your first question →
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyQuestions;
