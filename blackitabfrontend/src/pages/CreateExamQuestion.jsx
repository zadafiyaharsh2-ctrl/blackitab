import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlusCircle, FaEye, FaArrowLeft } from 'react-icons/fa';
import { CustomToast } from '../utils/CustomToast';
import axios from 'axios';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';

const SUBJECTS = [
  'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science',
  'English', 'General Knowledge', 'Reasoning', 'Data Interpretation'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const EXAMS = [
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
  { id: 'upsc', label: 'UPSC' },
  { id: 'gate', label: 'GATE' },
  { id: 'cat', label: 'CAT' },
];

const CreateExamQuestion = () => {
  usePageTitle('Create Question');
  const navigate = useNavigate();
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
        navigate('/my-questions');
      }
    } catch (err) {
      CustomToast.error(err.response?.data?.message || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-10 font-sans text-gray-100 overflow-x-hidden pt-20">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ x: [-20, 20, -20], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }} className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[120px]" />
      </div>

      <motion.div className="relative z-10 max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 rounded-xl glass-panel border border-white/10 text-gray-400 hover:text-white transition-colors">
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Question</h1>
            <p className="text-gray-400 text-sm mt-1">Add a new exam question to your question bank</p>
          </div>
        </div>

        {!preview ? (
          <div className="glass-panel p-6 md:p-8 border border-white/10 rounded-2xl space-y-6">
            {/* Exam & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Exam Type</label>
                <select value={form.exam} onChange={e => handleChange('exam', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50">
                  {EXAMS.map(e => <option key={e.id} value={e.id} className="bg-gray-900">{e.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Subject *</label>
                <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option value="" className="bg-gray-900">Select subject...</option>
                  {SUBJECTS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Question Text *</label>
              <textarea value={form.question} onChange={e => handleChange('question', e.target.value)}
                rows={4} placeholder="Type your question here..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
            </div>

            {/* Options */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Options *</label>
              <div className="space-y-3">
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button type="button" onClick={() => handleChange('correctAnswer', i)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                        parseInt(form.correctAnswer) === i
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                          : 'border-white/20 text-gray-500 hover:border-white/40'
                      }`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                    <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/50" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Click the letter to mark the correct answer</p>
            </div>

            {/* Difficulty & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button key={d} type="button" onClick={() => handleChange('difficulty', d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                        form.difficulty === d
                          ? d === 'Easy' ? 'border-green-500 bg-green-500/10 text-green-400'
                            : d === 'Hard' ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                          : 'border-white/10 text-gray-500 hover:border-white/20'
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => handleChange('tags', e.target.value)}
                  placeholder="e.g. mechanics, kinematics"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Explanation (optional)</label>
              <textarea value={form.explanation} onChange={e => handleChange('explanation', e.target.value)}
                rows={3} placeholder="Explain why the correct answer is correct..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleChange('isPublic', !form.isPublic)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.isPublic ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.isPublic ? 'left-6' : 'left-0.5'}`} />
              </button>
              <span className="text-sm text-gray-400">{form.isPublic ? 'Public (visible to all students)' : 'Institute only'}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setPreview(true)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                <FaEye /> Preview
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50">
                <FaPlusCircle /> {loading ? 'Creating...' : 'Create Question'}
              </motion.button>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE */
          <div className="glass-panel p-6 md:p-8 border border-white/10 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Preview</h2>
              <button onClick={() => setPreview(false)} className="text-sm text-blue-400 hover:text-blue-300">← Back to edit</button>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4 text-xs">
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase">{form.exam}</span>
                <span className="text-gray-500">{form.subject}</span>
                <span className={`px-2.5 py-1 rounded-full font-bold ${
                  form.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                  form.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>{form.difficulty}</span>
              </div>

              <p className="text-white text-lg font-medium mb-6">{form.question || 'No question text'}</p>

              <div className="space-y-3">
                {form.options.map((opt, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    parseInt(form.correctAnswer) === i
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/5 bg-white/[0.01]'
                  }`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      parseInt(form.correctAnswer) === i ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                    }`}>{String.fromCharCode(65 + i)}</span>
                    <span className="text-gray-300 text-sm">{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                    {parseInt(form.correctAnswer) === i && <span className="ml-auto text-emerald-400 text-xs font-bold">✓ Correct</span>}
                  </div>
                ))}
              </div>

              {form.explanation && (
                <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Explanation</p>
                  <p className="text-gray-300 text-sm">{form.explanation}</p>
                </div>
              )}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50">
              <FaPlusCircle /> {loading ? 'Creating...' : 'Confirm & Create'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreateExamQuestion;
