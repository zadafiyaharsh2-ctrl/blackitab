/**
 * ============================================================================
 * AI QUESTION GENERATOR PAGE
 * ============================================================================
 * 
 * Interactive page that uses the LangChain API (same as Ask AI) with
 * backend prompt tuning to generate MCQ questions on any topic.
 * 
 * Features:
 * - Topic/difficulty/count selection form
 * - AI-generated MCQ questions
 * - Interactive answer checking with explanations
 * - Score tracking
 * - History of generated question sets
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import API_URL from '../config';
import {
  FaRobot,
  FaSpinner,
  FaHistory,
  FaTrash,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaLightbulb,
  FaArrowRight,
  FaArrowLeft,
  FaRedo,
  FaBolt,
  FaTrophy
} from 'react-icons/fa';

const AIQuestionGenerator = () => {
  const { isDark } = useTheme();

  // Generator form state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [questionSet, setQuestionSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [quizComplete, setQuizComplete] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`${API_URL}/api/ai-questions/history?limit=30`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setQuestionSet(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizComplete(false);

    try {
      const response = await fetch(`${API_URL}/api/ai-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ topic: topic.trim(), difficulty, count })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      setQuestionSet(data.data);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadFromHistory = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/ai-questions/${id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQuestionSet(data.data);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setShowExplanation({});
        setQuizComplete(false);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Failed to load question set:', err);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/ai-questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleAnswerSelect = (questionIdx, optionIdx) => {
    if (selectedAnswers[questionIdx] !== undefined) return; // Already answered
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [questionIdx]: true }));
  };

  const getScore = () => {
    if (!questionSet) return { correct: 0, total: 0 };
    let correct = 0;
    questionSet.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correct++;
    });
    return { correct, total: questionSet.questions.length };
  };

  const handleFinishQuiz = () => {
    setQuizComplete(true);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation({});
    setQuizComplete(false);
  };

  const allAnswered = questionSet && Object.keys(selectedAnswers).length === questionSet.questions.length;

  // Suggested topics
  const suggestedTopics = [
    'SQL Joins', 'Data Structures', 'Operating Systems', 'OOP Concepts',
    'Network Protocols', 'Machine Learning Basics', 'React Hooks', 'Python Basics'
  ];

  const difficultyColors = {
    Easy: 'from-green-500 to-emerald-600',
    Medium: 'from-yellow-500 to-orange-600',
    Hard: 'from-red-500 to-pink-600'
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-white dark:bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <FaBolt className="text-2xl text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                AI Question Generator
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                Generate practice questions on any topic
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showHistory
                ? 'bg-emerald-600 text-gray-900 dark:text-white'
                : isDark
                  ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaHistory />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Main Area */}
          <div className={`flex-1 flex flex-col overflow-y-auto ${showHistory ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">

              {/* Generator Form — shown when no question set is active */}
              {!questionSet && !isGenerating && (
                <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                    Generate Questions
                  </h2>

                  <form onSubmit={handleGenerate} className="space-y-5">
                    {/* Topic Input */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                        Topic / Subject
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., SQL Joins, Data Structures, Machine Learning..."
                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-gray-900 dark:text-white placeholder-gray-500'
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    {/* Suggested Topics */}
                    <div>
                      <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        Quick topics:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTopics.map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTopic(t)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                              topic === t
                                ? 'bg-emerald-600 text-gray-900 dark:text-white'
                                : isDark
                                  ? 'bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty & Count Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Difficulty */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                          Difficulty
                        </label>
                        <div className="flex gap-2">
                          {['Easy', 'Medium', 'Hard'].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDifficulty(d)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                difficulty === d
                                  ? `bg-gradient-to-r ${difficultyColors[d]} text-gray-900 dark:text-white shadow-lg`
                                  : isDark
                                    ? 'bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Count */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-700 dark:text-gray-300' : 'text-gray-700'}`}>
                          Number of Questions
                        </label>
                        <div className="flex gap-2">
                          {[5, 10, 15].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setCount(n)}
                              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                count === n
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-900 dark:text-white shadow-lg'
                                  : isDark
                                    ? 'bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                        <FaTimesCircle />
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto"><FaTimes /></button>
                      </div>
                    )}

                    {/* Generate Button */}
                    <button
                      type="submit"
                      disabled={!topic.trim()}
                      className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                        !topic.trim()
                          ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-600 dark:text-gray-400'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-gray-900 dark:text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25'
                      }`}
                    >
                      <FaBolt />
                      Generate Questions
                    </button>
                  </form>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6">
                    <FaRobot className="text-4xl text-gray-900 dark:text-white animate-pulse" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                    Generating Questions...
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                    AI is crafting {count} {difficulty.toLowerCase()} questions on "{topic}"
                  </p>
                  <FaSpinner className={`animate-spin text-3xl mx-auto ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
              )}

              {/* Quiz Mode */}
              {questionSet && !quizComplete && (
                <div className="space-y-4">
                  {/* Quiz Header */}
                  <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200'}`}>
                    <div>
                      <h2 className={`text-lg font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                        {questionSet.topic}
                      </h2>
                      <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                        {questionSet.difficulty} • {questionSet.questions.length} Questions
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                        {Object.keys(selectedAnswers).length} / {questionSet.questions.length} answered
                      </span>
                      <button
                        onClick={() => { setQuestionSet(null); setError(null); }}
                        className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-50 dark:bg-gray-800' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
                      style={{ width: `${(Object.keys(selectedAnswers).length / questionSet.questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Card */}
                  {questionSet.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className={`rounded-2xl p-6 transition-all ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
                    >
                      {/* Question Number & Text */}
                      <div className="flex items-start gap-3 mb-5">
                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          selectedAnswers[qIdx] !== undefined
                            ? selectedAnswers[qIdx] === q.correctAnswer
                              ? 'bg-green-500 text-gray-900 dark:text-white'
                              : 'bg-red-500 text-gray-900 dark:text-white'
                            : isDark ? 'bg-gray-700 text-gray-700 dark:text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {qIdx + 1}
                        </span>
                        <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                          {q.question}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 ml-11">
                        {q.options.map((option, oIdx) => {
                          const isSelected = selectedAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctAnswer === oIdx;
                          const isRevealed = selectedAnswers[qIdx] !== undefined;

                          let optionStyle = isDark
                            ? 'bg-gray-700/50 border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-500'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300';

                          if (isRevealed) {
                            if (isCorrect) {
                              optionStyle = isDark
                                ? 'bg-green-900/30 border-green-500 text-green-300'
                                : 'bg-green-50 border-green-500 text-green-800';
                            } else if (isSelected && !isCorrect) {
                              optionStyle = isDark
                                ? 'bg-red-900/30 border-red-500 text-red-300'
                                : 'bg-red-50 border-red-500 text-red-800';
                            } else {
                              optionStyle = isDark
                                ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-500'
                                : 'bg-gray-50 border-gray-200 text-gray-600 dark:text-gray-400';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerSelect(qIdx, oIdx)}
                              disabled={isRevealed}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${optionStyle} ${
                                isRevealed ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                isRevealed && isCorrect
                                  ? 'border-green-500 bg-green-500 text-gray-900 dark:text-white'
                                  : isRevealed && isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-500 text-gray-900 dark:text-white'
                                    : isDark ? 'border-gray-600 text-gray-600 dark:text-gray-400' : 'border-gray-300 text-gray-500'
                              }`}>
                                {isRevealed && isCorrect ? <FaCheckCircle /> :
                                 isRevealed && isSelected && !isCorrect ? <FaTimesCircle /> :
                                 String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {showExplanation[qIdx] && (
                        <div className={`mt-4 ml-11 p-4 rounded-xl flex items-start gap-2 ${
                          isDark ? 'bg-blue-900/20 border border-blue-800 text-blue-200' : 'bg-blue-50 border border-blue-200 text-blue-800'
                        }`}>
                          <FaLightbulb className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                          <p className="text-sm leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Finish Button */}
                  {allAnswered && (
                    <div className="text-center py-4">
                      <button
                        onClick={handleFinishQuiz}
                        className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-gray-900 dark:text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto"
                      >
                        <FaTrophy />
                        View Results
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Complete — Score Screen */}
              {quizComplete && questionSet && (
                <div className={`rounded-2xl p-8 text-center ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg">
                    <FaTrophy className="text-5xl text-gray-900 dark:text-white" />
                  </div>

                  <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                    Quiz Complete!
                  </h2>

                  <p className={`text-lg mb-6 ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                    {questionSet.topic} • {questionSet.difficulty}
                  </p>

                  {/* Score */}
                  <div className={`inline-block px-8 py-4 rounded-2xl mb-8 ${
                    getScore().correct / getScore().total >= 0.8
                      ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                      : getScore().correct / getScore().total >= 0.5
                        ? isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                        : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-5xl font-bold mb-1 ${
                      getScore().correct / getScore().total >= 0.8
                        ? isDark ? 'text-green-300' : 'text-green-700'
                        : getScore().correct / getScore().total >= 0.5
                          ? isDark ? 'text-yellow-300' : 'text-yellow-700'
                          : isDark ? 'text-red-300' : 'text-red-700'
                    }`}>
                      {getScore().correct} / {getScore().total}
                    </p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                      {Math.round((getScore().correct / getScore().total) * 100)}% Correct
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                        isDark
                          ? 'bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaRedo /> Retry
                    </button>
                    <button
                      onClick={() => { setQuestionSet(null); setQuizComplete(false); }}
                      className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-gray-900 dark:text-white shadow-lg transition-all flex items-center gap-2"
                    >
                      <FaBolt /> New Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className={`w-full md:w-80 flex flex-col border-l ${isDark ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Generated Sets
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="md:hidden p-1"
                >
                  <FaTimes className={isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className={`animate-spin text-2xl ${isDark ? 'text-gray-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                ) : history.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    <FaRobot className="text-3xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No generated sets yet</p>
                    <p className="text-xs">Generate your first quiz!</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => loadFromHistory(item._id)}
                      className={`p-3 rounded-lg cursor-pointer group transition-all ${
                        isDark
                          ? 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                            {item.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.difficulty === 'Easy'
                                ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                                : item.difficulty === 'Medium'
                                  ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                                  : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.difficulty}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                              {item.questionCount}Q
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteHistoryItem(item._id, e)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
