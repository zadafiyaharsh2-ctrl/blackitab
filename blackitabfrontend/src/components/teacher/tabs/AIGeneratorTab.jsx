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
    <div>
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

            {/* Question Format */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Question Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" 
                    checked={format === 'Digital'}
                    onChange={() => setFormat('Digital')}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" 
                    checked={format === 'Paper'}
                    onChange={() => setFormat('Paper')}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" 
                  />
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Paper</span>
                </label>
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
          <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-hidden ${
            isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <FaCheckCircle className="text-2xl text-green-500" />
              <div className="min-w-0">
                <h2 className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  {generatedData.questionCount} Questions Successfully Generated!
                </h2>
                <p className={`text-sm break-words ${isDark ? 'text-green-500/70' : 'text-green-600'}`}>
                  Saved to your question bank • {generatedData.exam.toUpperCase()} • {generatedData.subject} • {generatedData.difficulty}
                </p>
              </div>
            </div>
            <button onClick={() => setGeneratedData(null)}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white border text-gray-700 hover:bg-gray-50'
              }`}>
              Generate More
            </button>
          </div>

          <div className="space-y-4">
            {generatedData.questions.map((q, idx) => (
              <div key={idx} className={`p-4 sm:p-6 rounded-2xl overflow-hidden ${isDark ? 'glass-panel border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-start gap-3 mb-4 min-w-0">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>{idx + 1}</span>
                  <p className={`font-medium text-lg leading-relaxed break-words min-w-0 ${isDark ? 'text-white' : 'text-gray-900'}`}>{q.question}</p>
                </div>

                <div className="space-y-2 ml-0 sm:ml-11">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAnswer === oIdx;
                    return (
                      <div key={oIdx} className={`p-3 rounded-xl border flex items-center gap-3 min-w-0 ${
                        isCorrect 
                          ? 'border-green-500/50 bg-green-500/10'
                          : isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-200 bg-gray-50'
                      }`}>
                         <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect ? 'bg-green-500 text-white' : (isDark ? 'bg-white/10 text-gray-400' : 'bg-white border text-gray-500')
                          }`}>
                            {isCorrect ? <FaCheckCircle /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className={`text-sm break-words min-w-0 ${isCorrect ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 ml-0 sm:ml-11 p-4 rounded-xl flex items-start gap-2 bg-blue-500/5 border border-blue-500/20">
                  <FaLightbulb className="flex-shrink-0 mt-0.5 text-blue-500" />
                  <p className={`text-sm leading-relaxed break-words ${isDark ? 'text-blue-200/80' : 'text-blue-800'}`}>{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGeneratorTab;
