import React, { useState } from 'react';
import { FaRobot, FaCheckCircle, FaLightbulb, FaSpinner, FaTimes, FaTimesCircle, FaBolt } from 'react-icons/fa';
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

const AIGeneratorTab = ({ isDark }) => {
  const [exam, setExam] = useState('jee');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState('Digital');
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
        body: JSON.stringify({ 
          topic: aiTopic, 
          difficulty, 
          count, 
          exam,
          format
        })
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
    <div className="max-w-4xl mx-auto space-y-8">
      {!generatedData && !isGenerating && (
        <div className={`p-8 sm:p-12 rounded-[2.5rem] border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#0061FF]/10 text-[#0061FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaRobot className="text-3xl" />
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Algorithmic Assembly</h2>
            <p className={`text-sm mt-2 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Deploy neural models to rapidly synthesize scholarly content.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Target Exam</label>
                <select value={exam} onChange={e => setExam(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                  {EXAMS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
                </select>
              </div>
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Subject Domain *</label>
                <select value={subject} onChange={e => setSubject(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                  <option value="">Select parameter...</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
              <label className={`block text-xs font-black uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sub-topic Directive (Optional)</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Thermodynamics, Graph Theory..."
                className={`w-full px-6 py-5 rounded-2xl outline-none text-lg font-medium transition-all focus:ring-2 focus:ring-[#0061FF]/30 border ${isDark ? 'bg-[#0a0a0a] border-white/10 text-white placeholder-gray-600 focus:border-[#0061FF]/50' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#0061FF]/30'}`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Complexity Quotient</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#05000a] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <label className={`block text-xs font-black uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Volume</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))}
                  className={`w-full px-5 py-4 rounded-xl outline-none font-bold cursor-pointer transition-all focus:ring-2 focus:ring-[#0061FF]/30 ${isDark ? 'bg-[#0a0a0a] border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-900 hover:border-gray-300'}`}>
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 flex items-center justify-between font-medium text-sm shadow-sm">
                <div className="flex items-center gap-3"><FaTimesCircle /> {error}</div>
                <button type="button" onClick={() => setError(null)}><FaTimes /></button>
              </div>
            )}

            <button type="submit" disabled={!subject.trim() && !topic.trim()}
              className="w-full py-5 rounded-full bg-[#0061FF] hover:bg-[#004bca] dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest text-sm shadow-xl transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2">
              <FaBolt className="text-lg" /> Generate Questions
            </button>
          </form>
        </div>
      )}

      {isGenerating && (
        <div className={`p-20 text-center rounded-[2.5rem] border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="mx-auto w-24 h-24 rounded-[2rem] bg-[#0061FF]/10 border border-[#0061FF]/20 flex items-center justify-center mb-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0061FF]/20 to-transparent animate-pulse" />
            <FaRobot className="text-4xl text-[#0061FF] relative z-10" />
          </div>
          <h3 className={`text-3xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Synthesizing Matrix</h3>
          <p className={`mb-10 text-base font-medium max-w-md mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Compiling {count} authoritative interrogations under the {difficulty.toUpperCase()} tier parameters for {exam.toUpperCase()}.
          </p>
          <FaSpinner className="animate-spin text-4xl mx-auto text-[#0061FF]" />
        </div>
      )}

      {generatedData && (
        <div className="space-y-8">
          <div className={`p-8 rounded-[2.5rem] border flex flex-col md:flex-row items-center gap-6 ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <FaCheckCircle className="text-3xl text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-2xl font-black tracking-tight mb-2 ${isDark ? 'text-emerald-400' : 'text-gray-900'}`}>Generation Successful</h2>
              <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transferred {generatedData.questionCount} queries to the Master Repository.</p>
            </div>
            <button onClick={() => setGeneratedData(null)}
              className="px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm border border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white shrink-0 shadow-sm">
              New Run
            </button>
          </div>

          <div className="space-y-6">
            {generatedData.questions.map((q, idx) => (
              <div key={idx} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex items-start gap-4 mb-8">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {idx + 1}
                  </span>
                  <h3 className={`text-xl font-bold leading-relaxed break-words ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</h3>
                </div>

                <div className="pl-0 sm:pl-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => {
                     const isCorrect = q.correctAnswer === oIdx;
                     return (
                        <div key={oIdx} className={`p-4 rounded-xl border flex items-center gap-4 ${
                          isCorrect 
                            ? isDark ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-emerald-50 border-emerald-500/40' 
                            : isDark ? 'bg-transparent border-white/5' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                             isCorrect ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/10 text-gray-500' : 'bg-white border border-gray-200 text-gray-400')
                          }`}>
                            {isCorrect ? <FaCheckCircle /> : String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className={`text-sm font-medium pt-0.5 break-words ${isCorrect ? (isDark ? 'text-emerald-400' : 'text-emerald-900') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                            {opt}
                          </span>
                        </div>
                     )
                  })}
                </div>
                {q.explanation && (
                  <div className={`mt-8 pl-0 sm:pl-12`}>
                     <div className={`p-5 rounded-2xl border flex gap-3 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="w-1 bg-[#0061FF] opacity-50 rounded-full shrink-0" />
                        <div>
                           <span className={`block text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm ${isDark ? 'text-[#0061FF]' : 'text-[#0061FF]'}`}>Reasoning</span>
                           <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{q.explanation}</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGeneratorTab;
