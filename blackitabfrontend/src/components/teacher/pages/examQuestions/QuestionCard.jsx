import React from 'react';
import { CheckCircle, XCircle, Sparkles, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

const QuestionCard = ({ question, currentIndex, totalQuestions, selectedAnswer, result, checkingId, onSelectOption, onSubmitAnswer, onReattempt, onPrev, onNext }) => {
  const { isDark } = useTheme();
  const q = question;

  const getOptionStyle = (optionIndex) => {
    const isSelected = selectedAnswer === optionIndex;
    if (!result) {
      return isSelected
        ? isDark ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-purple-500 bg-purple-50 text-purple-900'
        : isDark ? 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/30' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50';
    }
    if (optionIndex === result.correctAnswer) {
      return isDark ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-green-500 bg-green-100 text-green-800';
    }
    if (isSelected && !result.correct) {
      return isDark ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-red-500 bg-red-100 text-red-800';
    }
    return isDark ? 'border-gray-700/50 bg-gray-800/20 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400';
  };

  return (
    <>
      <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6 transition-all shadow-sm dark:shadow-none">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                Q{currentIndex + 1} of {totalQuestions}
              </span>
              {q.subject && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 text-xs rounded-full">{q.subject}</span>}
              {q.difficulty && (
                <span className={`px-3 py-1 text-xs rounded-full ${q.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                  q.difficulty === 'Hard' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                  'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'}`}>
                  {q.difficulty}
                </span>
              )}
              {Number.isFinite(q.eloGap) && <span className="px-3 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs rounded-full">Elo gap {q.eloGap}</span>}
              {q.isAIGenerated && (
                <span className="px-3 py-1 bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 text-xs rounded-full flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI</span>
              )}
              {q.format === 'Digital' && <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">Digital</span>}
              {q.format === 'Paper' && <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-xs rounded-full">Paper</span>}
            </div>
            <p className="text-gray-900 dark:text-white text-lg font-medium leading-relaxed">{q.question}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-4">
          {q.options.map((opt, optIdx) => (
            <button key={optIdx} onClick={() => onSelectOption(q._id, optIdx)} disabled={result !== undefined}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${getOptionStyle(optIdx)} ${result ? 'cursor-default' : 'cursor-pointer'}`}>
              <span className="w-8 h-8 flex items-center justify-center rounded-full border border-current/30 text-sm font-semibold shrink-0">{String.fromCharCode(65 + optIdx)}</span>
              <span className="flex-1">{opt}</span>
              {result && optIdx === result.correctAnswer && <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />}
              {result && selectedAnswer === optIdx && !result.correct && <XCircle className="h-5 w-5 text-red-400 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Submit / Result */}
        {!result ? (
          <button onClick={() => onSubmitAnswer(q._id)} disabled={selectedAnswer === undefined || checkingId === q._id}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2">
            {checkingId === q._id ? (<><Loader2 className="h-4 w-4 animate-spin" /> Checking...</>) : 'Submit Answer'}
          </button>
        ) : (
          <>
            <div className={`p-4 rounded-xl border ${result.correct
              ? 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
              : 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'}`}>
              <div className="flex items-center gap-2">
                {result.correct
                  ? <><CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /><span className="text-green-700 dark:text-green-400 font-semibold">Correct!</span></>
                  : <><XCircle className="h-5 w-5 text-red-600 dark:text-red-400" /><span className="text-red-700 dark:text-red-400 font-semibold">Not quite right</span></>}
              </div>
            </div>
            {!result.correct && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => onReattempt(q._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 text-gray-300 rounded-lg transition-all">
                  <ArrowLeft className="h-4 w-4" /> Reattempt Question
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={onPrev} disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 rounded-xl transition-all">
          <ChevronLeft className="h-5 w-5" /> Previous
        </button>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{currentIndex + 1} / {totalQuestions}</span>
        <button onClick={onNext} disabled={currentIndex === totalQuestions - 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:border-gray-500 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 rounded-xl transition-all">
          Next <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );
};

export default QuestionCard;
