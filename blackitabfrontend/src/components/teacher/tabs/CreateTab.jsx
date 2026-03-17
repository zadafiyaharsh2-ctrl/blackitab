import React, { useState } from 'react';
import { FaPlus, FaEye, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../config';
import { CustomToast } from '../../../utils/CustomToast';

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

const CreateTab = ({ isDark, setActiveTab }) => {
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exam: 'jee',
    subject: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'Medium',
    explanation: '',
    tags: '',
    isPublic: true,
    designatedFor: ['digital']
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
    if (form.correctAnswer === '') { CustomToast.error('Please mark the correct answer by clicking its letter index'); return false; }
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
      if (payload.designatedFor.length === 0) {
        payload.designatedFor = ['digital']; // fallback
      }
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
    <div>
      {!preview ? (
        <div className={`p-4 sm:p-6 md:p-8 rounded-2xl space-y-6 overflow-hidden ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
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
                <div key={i} className="flex items-center gap-3 min-w-0">
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
                    className={`flex-1 min-w-0 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/50 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'}`} />
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

          {/* Question Type & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Type</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={form.designatedFor.includes('digital')}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...form.designatedFor, 'digital'] 
                        : form.designatedFor.filter(t => t !== 'digital');
                      handleChange('designatedFor', newTypes);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" 
                    checked={form.designatedFor.includes('paper')}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...form.designatedFor, 'paper'] 
                        : form.designatedFor.filter(t => t !== 'paper');
                      handleChange('designatedFor', newTypes);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paper</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => handleChange('isPublic', !form.isPublic)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.isPublic ? 'bg-emerald-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${form.isPublic ? 'left-6' : 'left-0.5'}`} />
              </button>
              <span className="text-sm font-medium text-gray-500">{form.isPublic ? 'Public (visible to all students)' : 'Institute only'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
        <div className={`p-4 sm:p-6 md:p-8 rounded-2xl space-y-6 overflow-hidden ${isDark ? 'glass-panel border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Preview</h2>
            <button onClick={() => setPreview(false)} className="text-sm font-bold text-blue-500 hover:text-blue-400"><FaArrowLeft className="inline mr-1" /> Back to edit</button>
          </div>

          <div className={`rounded-2xl p-4 sm:p-6 overflow-hidden ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
            <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
              <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-full font-bold uppercase">{form.exam}</span>
              <span className="text-gray-500 font-medium">{form.subject}</span>
              <span className={`px-2.5 py-1 rounded-full font-bold ${
                form.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                form.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500' :
                'bg-yellow-500/10 text-yellow-600'
              }`}>{form.difficulty}</span>
            </div>

            <p className={`text-lg font-medium mb-6 break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{form.question || 'No question text'}</p>

            <div className="space-y-3">
              {form.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 min-w-0 p-3 rounded-xl border transition-all ${
                  parseInt(form.correctAnswer) === i
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-white'
                }`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    parseInt(form.correctAnswer) === i ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span className={`text-sm break-words min-w-0 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt || `Option ${String.fromCharCode(65 + i)}`}</span>
                  {parseInt(form.correctAnswer) === i && <span className="ml-auto shrink-0 text-emerald-500 text-xs font-bold">✓ Correct</span>}
                </div>
              ))}
            </div>

            {form.explanation && (
              <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-2">Explanation</p>
                <p className={`text-sm break-words ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{form.explanation}</p>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-all hover:scale-[1.02]">
            <FaCheckCircle /> {loading ? 'Creating...' : 'Confirm & Create'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTab;
