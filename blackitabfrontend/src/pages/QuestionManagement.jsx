import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FaList, FaPlus, FaRobot, FaEdit, FaTrash, FaSearch, FaFilter, FaCheckCircle, FaLightbulb, FaBolt, FaSpinner, FaEye, FaArrowLeft, FaTimes, FaTimesCircle } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
import { useTheme } from '../context/useTheme';

const EXAMS = [
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'gate', label: 'GATE' },
  { id: 'cat', label: 'CAT' },
];

const SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science',
  'English', 'General Knowledge', 'Reasoning', 'Data Interpretation'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const QuestionManagement = () => {
  usePageTitle('Question Bank');
  const { isDark } = useTheme();

  // Tabs: 'my-bank', 'create', 'ai'
  const [activeTab, setActiveTab] = useState('my-bank');

  return (
    <div className={`min-h-screen relative p-4 md:p-8 lg:p-10 font-sans transition-colors ${
      isDark ? 'text-gray-100 bg-gray-900' : 'text-gray-900 bg-gray-50'
    } overflow-x-hidden pt-20`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Question Management
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your question bank, create new ones, or use AI generation.
            </p>
          </div>

          <div className={`flex p-1 rounded-xl glass-panel ${isDark ? 'border-white/10' : 'border-gray-200 shadow-sm'}`}>
            <button onClick={() => setActiveTab('my-bank')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'my-bank'
                  ? 'bg-blue-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaList /> My Bank
            </button>
            <button onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaPlus /> Create Manually
            </button>
            <button onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaRobot /> AI Generator
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-bank' && <MyBankTab key="my-bank" isDark={isDark} />}
          {activeTab === 'create' && <CreateTab key="create" isDark={isDark} setActiveTab={setActiveTab} />}
          {activeTab === 'ai' && <AIGeneratorTab key="ai" isDark={isDark} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =========================================================================
// TAB 1: MY BANK
// =========================================================================
const MyBankTab = ({ isDark }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExam, setFilterExam] = useState('');
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
    } catch (error) {
      console.error('Fetch questions error:', error);
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
    } catch (error) {
      console.error(error);
      CustomToast.error("Failed to delete question");
    }
  };

  const filtered = questions.filter(q => {
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
    if (filterSubject && q.subject !== filterSubject) return false;
    if (filterExam && q.exam !== filterExam) return false;
    return true;
  });

  const subjects = [...new Set(questions.map(q => q.subject))];

  // Grouping logic
  const groupedQuestions = filtered.reduce((acc, q) => {
    const examStr = q.exam ? q.exam.toUpperCase() : 'OTHER';
    const subjectStr = q.subject || 'Uncategorized';
    
    if (!acc[examStr]) acc[examStr] = {};
    if (!acc[examStr][subjectStr]) acc[examStr][subjectStr] = [];
    
    acc[examStr][subjectStr].push(q);
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Filters */}
      <div className={`p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
            }`} />
        </div>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Exams</option>
          {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
        </select>
        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Difficulty</option>
          <option value="Easy" className={isDark ? 'bg-gray-900' : 'bg-white'}>Easy</option>
          <option value="Medium" className={isDark ? 'bg-gray-900' : 'bg-white'}>Medium</option>
          <option value="Hard" className={isDark ? 'bg-gray-900' : 'bg-white'}>Hard</option>
        </select>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-white/5 border border-white/10 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
          <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>All Subjects</option>
          {subjects.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
        </select>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          <FaSpinner className="animate-spin text-3xl mx-auto mb-3" />
          <p>Loading questions...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(groupedQuestions).map(exam => (
            <div key={exam} className="space-y-6">
              <h2 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" /> {exam}
              </h2>
              <div className="space-y-6 pl-2">
                {Object.keys(groupedQuestions[exam]).map(subject => (
                  <div key={subject} className="space-y-3">
                    <h3 className={`text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {subject}
                    </h3>
                    <div className="space-y-3 pl-4 border-l-2 border-gray-100 dark:border-white/5">
                      {groupedQuestions[exam][subject].map((q, i) => (
                        <div key={q._id || i}
                          className={`p-5 rounded-2xl flex items-start flex-col sm:flex-row gap-4 group transition-all ${
                            isDark ? 'glass-panel border border-white/10 hover:border-white/20' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                          }`}>
                          <div className="flex-1 min-w-0 w-full">
                            <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full font-bold ${
                                q.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                                q.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                                'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                              }`}>{q.difficulty}</span>
                              {q.tags?.length > 0 && q.tags.map(t => (
                                <span key={t} className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 self-end sm:self-auto">
                            {deleteConfirm === q._id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(q._id)} className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg font-bold">Delete</button>
                                <button onClick={() => setDeleteConfirm(null)} className={`px-3 py-1.5 text-xs rounded-lg ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(q._id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'}`}>
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-20 rounded-2xl ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 border-dashed'}`}>
          <FaFilter className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{questions.length > 0 ? 'No questions match your filters' : 'No questions yet in your bank'}</p>
        </div>
      )}
    </motion.div>
  );
};

// =========================================================================
// TAB 2: CREATE MANUALLY
// =========================================================================
const CreateTab = ({ isDark, setActiveTab }) => {
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exam: 'jee',
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'Medium',
    explanation: '',
    tags: '',
    isPublic: true,
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm(prev => ({ ...prev, options: newOptions }));
  };

  const validate = () => {
    if (!form.subject) { CustomToast.error('Please select a subject'); return false; }
    if (!form.question.trim()) { CustomToast.error('Question text is required'); return false; }
    if (form.options.some(o => !o.trim())) { CustomToast.error('All 4 options are required'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        correctAnswer: parseInt(form.correctAnswer),
      };
      const res = await axios.post(`${API_URL}/api/exams/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        CustomToast.success('Question created successfully!');
        setActiveTab('my-bank'); // Switch back to bank
      }
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {!preview ? (
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          {/* Exam & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Exam Type</label>
              <select value={form.exam} onChange={e => handleChange('exam', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Subject *</label>
              <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>Select subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Text *</label>
            <textarea value={form.question} onChange={e => handleChange('question', e.target.value)}
              rows={4} placeholder="Type your question here..."
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Options *</label>
            <div className="space-y-3">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button type="button" onClick={() => handleChange('correctAnswer', i)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                      parseInt(form.correctAnswer) === i
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500'
                        : isDark ? 'border-white/20 text-gray-500 hover:border-white/40' : 'border-gray-300 text-gray-400 hover:border-gray-400'
                    }`}>
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className={`flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Click the letter to mark the correct answer</p>
          </div>

          {/* Difficulty & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => handleChange('difficulty', d)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                      form.difficulty === d
                        ? d === 'Easy' ? 'border-green-500 bg-green-500/10 text-green-500'
                          : d === 'Hard' ? 'border-red-500 bg-red-500/10 text-red-500'
                          : 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => handleChange('tags', e.target.value)}
                placeholder="e.g. mechanics, kinematics"
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Explanation (optional)</label>
            <textarea value={form.explanation} onChange={e => handleChange('explanation', e.target.value)}
              rows={3} placeholder="Explain why the correct answer is correct..."
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => handleChange('isPublic', !form.isPublic)}
              className={`w-12 h-6 rounded-full transition-all relative ${form.isPublic ? 'bg-emerald-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${form.isPublic ? 'left-6' : 'left-0.5'}`} />
            </button>
            <span className="text-sm font-medium text-gray-500">{form.isPublic ? 'Public (visible to all students)' : 'Institute only'}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button onClick={() => setPreview(true)}
              className={`flex-1 py-3.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-colors ${
                isDark ? 'border-white/10 bg-white/5 text-white hover:bg-white/10' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}>
              <FaEye /> Preview
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all hover:scale-[1.02]">
              <FaPlus /> {loading ? 'Creating...' : 'Create Question'}
            </button>
          </div>
        </div>
      ) : (
        /* PREVIEW MODE */
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview</h2>
            <button onClick={() => setPreview(false)} className="text-sm font-bold text-blue-500 hover:text-blue-400"><FaArrowLeft className="inline mr-1" /> Back to edit</button>
          </div>

          <div className={`rounded-2xl p-6 ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-4 text-xs">
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold uppercase">{form.exam}</span>
              <span className="text-gray-500 font-medium">{form.subject}</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${
                form.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                form.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                'bg-yellow-500/10 text-yellow-600'
              }`}>{form.difficulty}</span>
            </div>

            <p className={`text-lg font-medium mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{form.question || 'No question text'}</p>

            <div className="space-y-3">
              {form.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  parseInt(form.correctAnswer) === i
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-white'
                }`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    parseInt(form.correctAnswer) === i ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                  {parseInt(form.correctAnswer) === i && <span className="ml-auto text-emerald-500 text-xs font-bold">✓ Correct</span>}
                </div>
              ))}
            </div>

            {form.explanation && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Explanation</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{form.explanation}</p>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all hover:scale-[1.02]">
            <FaCheckCircle /> {loading ? 'Creating...' : 'Confirm & Create'}
          </button>
        </div>
      )}
    </motion.div>
  );
};

// =========================================================================
// TAB 3: AI GENERATOR
// =========================================================================
const AIGeneratorTab = ({ isDark }) => {
  const [exam, setExam] = useState('jee');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || isGenerating) {
        if (!subject.trim() && !topic.trim()) {
            CustomToast.error('Please select a subject or define a topic');
        }
        return;
    }

    const aiTopic = topic.trim() ? `${subject ? subject + ': ' : ''}${topic.trim()}` : subject;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ai-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: aiTopic, difficulty, count, exam })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      setGeneratedData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Input Form */}
      {!generatedData && !isGenerating && (
        <div className={`p-6 md:p-8 rounded-2xl space-y-6 ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Exam & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Target Exam</label>
                <select value={exam} onChange={e => setExam(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {EXAMS.map(e => <option key={e.id} value={e.id} className={isDark ? 'bg-gray-900' : 'bg-white'}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Subject *</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  <option value="" className={isDark ? 'bg-gray-900' : 'bg-white'}>Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s} className={isDark ? 'bg-gray-900' : 'bg-white'}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Topic Input */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Specific Topic (Optional)</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Thermodynamics, Operating Systems..."
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
            </div>

            {/* Difficulty & Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Difficulty</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {DIFFICULTIES.map(d => <option key={d} value={d} className={isDark ? 'bg-gray-900' : 'bg-white'}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Count</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  {[5, 10, 15, 20].map(n => <option key={n} value={n} className={isDark ? 'bg-gray-900' : 'bg-white'}>{n} Questions</option>)}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm"><FaTimesCircle /> {error}</div>
                <button type="button" onClick={() => setError(null)}><FaTimes /></button>
              </div>
            )}

            <button type="submit" disabled={!subject.trim() && !topic.trim()}
              className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 transition-all hover:scale-[1.01]">
              <FaBolt /> Generate Using AI
            </button>
          </form>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className={`p-12 text-center rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border-gray-200 border'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-6 shadow-lg shadow-purple-500/30">
            <FaRobot className="text-4xl text-white animate-pulse" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Generating Questions...</h3>
          <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Crafting {count} {difficulty.toLowerCase()} questions for {subject || 'Any subject'}{topic ? ` on "${topic}"` : ''} for {exam.toUpperCase()}
          </p>
          <FaSpinner className="animate-spin text-3xl mx-auto text-purple-500" />
        </div>
      )}

      {/* Results Display */}
      {generatedData && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 border flex items-center justify-between ${
            isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-2xl text-green-500" />
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  {generatedData.questionCount} Questions Successfully Generated!
                </h2>
                <p className={`text-sm ${isDark ? 'text-green-500/70' : 'text-green-600'}`}>
                  Saved to your question bank • {generatedData.exam.toUpperCase()} • {generatedData.subject} • {generatedData.difficulty}
                </p>
              </div>
            </div>
            <button onClick={() => setGeneratedData(null)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}>
              Generate More
            </button>
          </div>

          <div className="space-y-4">
            {generatedData.questions.map((q, idx) => (
              <div key={idx} className={`p-6 rounded-2xl ${isDark ? 'glass-panel border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>{idx + 1}</span>
                  <p className={`font-medium text-lg leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</p>
                </div>

                <div className="space-y-2 ml-11">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAnswer === oIdx;
                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 ${
                        isCorrect 
                          ? 'border-green-500/50 bg-green-500/10'
                          : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-gray-50'
                      }`}>
                         <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect ? 'bg-green-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-white border text-gray-500')
                          }`}>
                            {isCorrect ? <FaCheckCircle /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className={`text-sm ${isCorrect ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 ml-11 p-4 rounded-xl flex items-start gap-2 bg-blue-500/5 border border-blue-500/20">
                  <FaLightbulb className="flex-shrink-0 mt-0.5 text-blue-500" />
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-200/80' : 'text-blue-800'}`}>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionManagement;
