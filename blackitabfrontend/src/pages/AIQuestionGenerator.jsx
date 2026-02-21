import { useState } from 'react';
import { useTheme } from '../context/useTheme';
import API_URL from '../config';
import {
  FaRobot,
  FaSpinner,
  FaTimes,
  FaTimesCircle,
  FaCheckCircle,
  FaLightbulb,
  FaBolt
} from 'react-icons/fa';

const AIQuestionGenerator = () => {
  const { isDark } = useTheme();

  // Generator form state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [exam, setExam] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generated questions (read-only display)
  const [generatedData, setGeneratedData] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedData(null);

    try {
      const response = await fetch(`${API_URL}/api/ai-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ topic: topic.trim(), difficulty, count, exam })
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

  const suggestedTopics = [
    'SQL Joins', 'Data Structures', 'Operating Systems', 'OOP Concepts',
    'Network Protocols', 'Machine Learning Basics', 'React Hooks', 'Python Basics'
  ];

  const difficultyColors = {
    Easy: 'from-green-500 to-emerald-600',
    Medium: 'from-yellow-500 to-orange-600',
    Hard: 'from-red-500 to-pink-600'
  };

  const examColors = {
    jee: 'from-purple-500 to-indigo-600',
    neet: 'from-green-500 to-emerald-600',
    upsc: 'from-blue-500 to-cyan-600',
    gate: 'from-orange-500 to-red-600',
    cat: 'from-pink-500 to-rose-600'
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-white dark:bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">

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
        </div>

        {/* Generator Form — shown when no generated data */}
        {!generatedData && !isGenerating && (
          <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Generate Questions
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Exam Selector */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Exam
                </label>
                <div className="flex flex-wrap gap-2">
                  {['jee', 'neet', 'upsc', 'gate', 'cat'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setExam(e)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${exam === e
                          ? `bg-gradient-to-r ${examColors[e]} text-white shadow-lg`
                          : isDark
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {e.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Thermodynamics, Organic Chemistry, Calculus..."
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-emerald-500 focus:outline-none ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                />
              </div>

              {/* Suggested Topics */}
              <div>
                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Quick topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${topic === t
                          ? 'bg-emerald-600 text-white'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${difficulty === d
                            ? `bg-gradient-to-r ${difficultyColors[d]} text-white shadow-lg`
                            : isDark
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
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
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Number of Questions
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${count === n
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                            : isDark
                              ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
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
                className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${!topic.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-400'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25'
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
          <div className={`rounded-2xl p-12 text-center ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 mb-6">
              <FaRobot className="text-4xl text-white animate-pulse" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Generating Questions...
            </h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AI is crafting {count} {difficulty.toLowerCase()} questions on "{topic}" for {exam.toUpperCase()}
            </p>
            <FaSpinner className={`animate-spin text-3xl mx-auto ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          </div>
        )}

        {/* Generated Questions — Read-Only Display */}
        {generatedData && (
          <div className="space-y-4">
            {/* Success Header */}
            <div className={`rounded-2xl p-5 ${isDark ? 'bg-green-900/20 border border-green-700/50' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                      {generatedData.questionCount} Questions Added!
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-600'}`}>
                      Added to <span className="font-semibold">{generatedData.exam.toUpperCase()}</span> exam bank
                      &nbsp;•&nbsp; Subject: <span className="font-semibold">{generatedData.subject}</span>
                      &nbsp;•&nbsp; {generatedData.difficulty}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGeneratedData(null)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FaBolt className="inline mr-1.5" />
                  Generate More
                </button>
              </div>
            </div>

            {/* Question Cards */}
            {generatedData.questions.map((q, qIdx) => (
              <div
                key={q._id || qIdx}
                className={`rounded-2xl p-6 transition-all ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                {/* Question Number & Text */}
                <div className="flex items-start gap-3 mb-4">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {qIdx + 1}
                  </span>
                  <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {q.question}
                  </p>
                </div>

                {/* Options — read only, correct answer highlighted */}
                <div className="space-y-2 ml-11">
                  {q.options.map((option, oIdx) => {
                    const isCorrect = q.correctAnswer === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-3  ${isCorrect
                            ? isDark
                              ? 'bg-green-900/30 border-green-500 text-green-300'
                              : 'bg-green-50 border-green-500 text-green-800'
                            : isDark
                              ? 'bg-gray-700/30 border-gray-700 text-gray-400'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'
                          }`}>
                          {isCorrect ? <FaCheckCircle /> : String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className={`mt-4 ml-11 p-4 rounded-xl flex items-start gap-2 ${isDark ? 'bg-blue-900/20 border border-blue-800 text-blue-200' : 'bg-blue-50 border border-blue-200 text-blue-800'
                  }`}>
                  <FaLightbulb className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <p className="text-sm leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
