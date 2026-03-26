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
    format: 'Digital',
    isPYQ: false,
    sourceYear: '',
    sourceShift: '',
    sourcePart: '',
    sourceDate: '',
    sourceExamName: ''
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
      
      // Clean up empty PYQ fields
      if (!payload.isPYQ) {
        delete payload.sourceYear;
        delete payload.sourceShift;
        delete payload.sourcePart;
        delete payload.sourceDate;
        delete payload.sourceExamName;
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
    <div className="max-w-4xl mx-auto">
      {!preview ? (
        <div className={`p-8 sm:p-12 rounded-[2.5rem] space-y-10 border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#0061FF]/10 text-[#0061FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaPlus className="text-2xl" />
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Manual Question Ingestion</h2>
            <p className={`text-sm mt-2 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add a new scholarly query directly into the registry matrix.</p>
          </div>

          {/* Exam & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Exam Category</label>
              <select value={form.exam} onChange={e => handleChange('exam', e.target.value)}
                className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                {EXAMS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subject Domain *</label>
              <select value={form.subject} onChange={e => handleChange('subject', e.target.value)}
                className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                <option value="">Select subject...</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Primary Inquiry *</label>
            <textarea value={form.question} onChange={e => handleChange('question', e.target.value)}
              rows={4} placeholder="Articulate the question here..."
              className={`w-full px-6 py-5 rounded-2xl outline-none resize-y text-lg font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-gray-600 focus:border-[#0061FF]/50' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0061FF]/30'}`} />
          </div>

          {/* Options */}
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <label className={`block text-xs font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Multiple Choice Vectors *</label>
            <div className="grid grid-cols-1 gap-4">
              {form.options.map((opt, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-4">
                  <button type="button" onClick={() => handleChange('correctAnswer', i)}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-black flex-shrink-0 transition-all ${
                      parseInt(form.correctAnswer) === i
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isDark ? 'border-white/20 text-gray-500 hover:bg-white/5' : 'border-gray-300 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                    }`}>
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                    placeholder={`Vector ${String.fromCharCode(65 + i)} parameters`}
                    className={`flex-1 w-full px-6 py-4 rounded-xl outline-none font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${
                      parseInt(form.correctAnswer) === i 
                       ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 dark:border-emerald-500' 
                       : isDark ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`} />
                </div>
              ))}
            </div>
            <p className={`text-xs mt-4 font-bold tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Mark the absolute correct vector by clicking its letter index.</p>
          </div>

          {/* Difficulty & format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Complexity Rating</label>
              <div className="flex gap-2 bg-[#0a0a0a] dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
                {DIFFICULTIES.map(d => (
                  <button key={d} type="button" onClick={() => handleChange('difficulty', d)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      form.difficulty === d
                        ? 'bg-white dark:bg-[#05000a] shadow-sm text-[#0061FF]'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                    }`}>{d}</button>
                ))}
              </div>
            </div>
            <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
               <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Origin Format</label>
               <div className="flex gap-2 bg-[#0a0a0a] dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
                  {['Digital', 'Paper'].map((f) => (
                    <button key={f} type="button" onClick={() => handleChange('format', f)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                          form.format === f
                            ? 'bg-white dark:bg-[#05000a] shadow-sm text-[#0061FF]'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                        }`}>{f}</button>
                  ))}
               </div>
            </div>
          </div>

          {/* PYQ Metadata */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
            <label className="flex items-center gap-2 cursor-pointer mb-2 w-fit">
              <input type="checkbox" checked={form.isPYQ || false} onChange={e => handleChange('isPYQ', e.target.checked)} className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
              <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Previous Year Question (PYQ)</span>
            </label>
            {form.isPYQ && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Year</label>
                  <input type="number" placeholder="e.g. 2023" value={form.sourceYear || ''} onChange={e => handleChange('sourceYear', parseInt(e.target.value) || '')} className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-amber-200 text-gray-900'} border`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Exam Name (If different)</label>
                  <input type="text" placeholder="e.g. JEE Advanced" value={form.sourceExamName || ''} onChange={e => handleChange('sourceExamName', e.target.value)} className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-amber-200 text-gray-900'} border`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Exact Date</label>
                  <input type="date" value={form.sourceDate ? form.sourceDate.split('T')[0] : ''} onChange={e => handleChange('sourceDate', e.target.value)} className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark ? 'bg-black/20 border-white/10 text-[13px] text-white' : 'bg-white border-amber-200 text-gray-900 text-[13px]'} border [&::-webkit-calendar-picker-indicator]:opacity-50 dark:[&::-webkit-calendar-picker-indicator]:invert`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Shift</label>
                  <input type="number" placeholder="e.g. 1" value={form.sourceShift || ''} onChange={e => handleChange('sourceShift', parseInt(e.target.value) || '')} className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-amber-200 text-gray-900'} border`} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Part / Session</label>
                  <input type="text" placeholder="e.g. Session 2" value={form.sourcePart || ''} onChange={e => handleChange('sourcePart', e.target.value)} className={`w-full px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-white border-amber-200 text-gray-900'} border`} />
                </div>
              </div>
            )}
          </div>



          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Didactic Explanation (Optional)</label>
            <textarea value={form.explanation} onChange={e => handleChange('explanation', e.target.value)}
              rows={3} placeholder="Detail the logical resolution path..."
              className={`w-full px-6 py-5 rounded-2xl outline-none resize-y font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-gray-600 focus:border-[#0061FF]/50' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0061FF]/30'}`} />
          </div>

          <div className={`p-8 rounded-3xl border flex flex-col sm:flex-row gap-4 ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
            <button onClick={() => setPreview(true)}
              className={`flex-1 py-4 rounded-full font-bold uppercase tracking-wider text-sm transition-colors border ${
                isDark ? 'bg-transparent text-[#0061FF] border-[#0061FF]/30 hover:bg-[#0061FF]/5' : 'bg-white text-[#0061FF] border-gray-200 hover:border-[#0061FF]/30'
              }`}>
              Audit Preview
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold uppercase tracking-wider text-sm shadow-lg transition-transform hover:scale-105 disabled:opacity-50">
              {loading ? 'Ingesting...' : 'Inject Record'}
            </button>
          </div>
        </div>
      ) : (
        /* PREVIEW MODE */
        <div className={`p-8 sm:p-12 rounded-[2.5rem] space-y-10 border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between border-b pb-6 border-gray-100 dark:border-white/5">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Auditing Preview</h2>
            <button onClick={() => setPreview(false)} className="text-xs font-black uppercase tracking-widest text-[#0061FF] hover:text-[#0061FF]/80 flex items-center"><FaArrowLeft className="mr-2" /> Resume Edit</button>
          </div>

          <div className={`rounded-3xl p-8 border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="px-4 py-1.5 bg-[#0061FF]/10 text-[#0061FF] border border-[#0061FF]/20 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">{form.exam}</span>
              <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 text-gray-400 border-white/5' : 'bg-white text-gray-600 border-gray-200'}`}>{form.subject}</span>
              <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                form.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                form.difficulty === 'Hard' ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
              }`}>{form.difficulty}</span>
            </div>

            <p className={`text-xl font-bold mb-10 leading-relaxed break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{form.question || 'No designated inquiry text...'}</p>

            <div className="space-y-4">
              {form.options.map((opt, i) => (
                <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                  parseInt(form.correctAnswer) === i
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/30'
                    : isDark ? 'border-white/5 bg-[#0a0a0a]' : 'border-gray-200 bg-white'
                }`}>
                  <span className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-xs font-black mt-0.5 ${
                    parseInt(form.correctAnswer) === i ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span className={`text-base font-medium leading-relaxed break-words pt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt || `<Empty Vector>`}</span>
                  {parseInt(form.correctAnswer) === i && <span className="ml-auto mt-1.5 shrink-0 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Confirmed Correct</span>}
                </div>
              ))}
            </div>

            {form.explanation && (
              <div className={`mt-10 p-6 rounded-2xl border flex gap-4 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="w-1.5 bg-gray-300 dark:bg-gray-700 rounded-full shrink-0" />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-2 block ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Official Explanation</p>
                  <p className={`text-sm leading-relaxed break-words font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{form.explanation}</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-sm shadow-xl transition-transform hover:scale-105 disabled:opacity-50 flex justify-center items-center gap-2">
            <FaCheckCircle className="text-lg" /> {loading ? 'Committing...' : 'Finalize & Inject'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTab;
