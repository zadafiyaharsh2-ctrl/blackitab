import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, BrainCircuit, Book } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../../../../context/ThemeContext';

const FocusModeOverlay = ({
  focusQuestions, focusIndex, focusSelectedOption, setFocusSelectedOption,
  focusResultIndicator, isAdaptiveSequence, adaptiveStage, adaptiveFailedCount,
  currentAdaptiveQuestion, currentAdaptiveDifficulty,
  isGeneratingAdaptive, showTheory, loadingTheory, theoryContent,
  checkingId, handleFocusSubmit, handleFocusNext, stopFocusMode
}) => {
  const { isDark } = useTheme();
  const difficultyMap = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
  const q = focusQuestions[focusIndex];

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-purple-50'}`}>
      {/* Progress Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-r-full"
          initial={{ width: 0 }} animate={{ width: `${((focusIndex + 1) / focusQuestions.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }} />
      </div>

      {/* Exit Button */}
      <button onClick={stopFocusMode}
        className={`absolute top-6 right-8 font-semibold text-sm px-4 py-2 rounded-lg border transition-all duration-200 ${isDark ? 'text-gray-400 hover:text-red-400 bg-gray-900 border-gray-700 hover:border-red-500/50' : 'text-gray-500 hover:text-red-500 bg-white border-gray-200 hover:border-red-300 shadow-sm'}`}>
        Exit Exam Mode
      </button>

      <div className="w-full max-w-3xl">
        {showTheory ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className={`p-8 rounded-2xl border shadow-2xl ${isDark ? 'bg-gray-900 border-blue-500/40 shadow-blue-900/20' : 'bg-white border-blue-200 shadow-blue-100/50'}`}>
            <h2 className={`text-2xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Book className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} /> Study Review Session
            </h2>
            <p className={`mb-6 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>You missed 3 or more questions. Review these core concepts before continuing.</p>
            {loadingTheory ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className={`h-10 w-10 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <p className={isDark ? 'text-blue-300' : 'text-blue-600'}>AI Tutor is compiling your tailored study guide...</p>
              </div>
            ) : (
              <div className={`prose max-w-none max-h-[50vh] overflow-y-auto pr-4 mb-8 p-6 rounded-xl border ${isDark ? 'prose-invert text-gray-300 bg-gray-950/50 border-gray-700/50' : 'text-gray-700 bg-gray-50 border-gray-200'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{theoryContent}</ReactMarkdown>
              </div>
            )}
            {!loadingTheory && (
              <button onClick={stopFocusMode} className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30">
                Finish Review & Exit
              </button>
            )}
          </motion.div>
        ) : isGeneratingAdaptive ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className={`flex flex-col items-center justify-center py-20 px-8 rounded-2xl border shadow-2xl ${isDark ? 'bg-gray-900 border-purple-500/30 shadow-purple-900/20' : 'bg-white border-purple-200 shadow-purple-100/50'}`}>
            <div className={`p-5 rounded-full mb-6 ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
              <BrainCircuit className={`h-14 w-14 animate-pulse ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Generating Adaptive Question...</h2>
            <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Adjusting difficulty based on your previous answers.</p>
            <div className="mt-8 flex gap-2">
              {[0, 150, 300].map(delay => (
                <div key={delay} className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key={isAdaptiveSequence ? `adaptive-${adaptiveStage}` : `focus-${focusIndex}`}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`p-8 flex flex-col rounded-2xl border shadow-2xl transition-all ${isDark ? 'bg-gray-900 border-purple-500/30 shadow-purple-900/20' : 'bg-white border-purple-200/60 shadow-purple-100/40'}`}>
            {/* Header Row */}
            <div className="flex justify-between items-center mb-6">
              <span className={`px-4 py-1.5 font-bold rounded-full border text-sm ${isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                {isAdaptiveSequence ? `Practice Round ${adaptiveStage + 1}` : `Question ${focusIndex + 1} of ${focusQuestions.length}`}
              </span>
              <div className="flex gap-2 items-center">
                {isAdaptiveSequence && (
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    currentAdaptiveDifficulty === 1 ? (isDark ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-green-300 text-green-700 bg-green-50')
                    : currentAdaptiveDifficulty === 2 ? (isDark ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : 'border-yellow-300 text-yellow-700 bg-yellow-50')
                    : (isDark ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-red-300 text-red-700 bg-red-50')
                  }`}>Diff: {difficultyMap[currentAdaptiveDifficulty]}</span>
                )}
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Focus Mode</span>
              </div>
            </div>

            {/* Question Text */}
            <p className={`text-2xl font-medium leading-relaxed mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isAdaptiveSequence && currentAdaptiveQuestion ? currentAdaptiveQuestion.question : q.question}
            </p>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {(isAdaptiveSequence && currentAdaptiveQuestion ? currentAdaptiveQuestion.options : q.options).map((opt, i) => {
                const isSelected = focusSelectedOption === i;
                let optionStyle = isDark ? 'border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-800/60' : 'border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50';
                if (focusResultIndicator) {
                  if (isSelected && focusResultIndicator === 'correct') optionStyle = isDark ? 'border-green-500 bg-green-500/15 text-green-300 cursor-default' : 'border-green-500 bg-green-50 text-green-800 cursor-default';
                  else if (isSelected && focusResultIndicator === 'wrong') optionStyle = isDark ? 'border-red-500 bg-red-500/15 text-red-300 cursor-default' : 'border-red-500 bg-red-50 text-red-800 cursor-default';
                  else optionStyle = isDark ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-default opacity-50' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-default opacity-50';
                } else if (isSelected) {
                  optionStyle = isDark ? 'border-purple-500 bg-purple-500/15 text-white shadow-lg shadow-purple-900/20' : 'border-purple-500 bg-purple-50 text-purple-900 shadow-md shadow-purple-200/50';
                }
                const correctHighlight = focusResultIndicator && isAdaptiveSequence && currentAdaptiveQuestion && currentAdaptiveQuestion.correctAnswer === i
                  ? (isDark ? '!border-green-500/80 !border-dashed' : '!border-green-500 !border-dashed !bg-green-50/50') : '';

                return (
                  <button key={i} onClick={() => !focusResultIndicator && setFocusSelectedOption(i)} disabled={focusResultIndicator !== null}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${optionStyle} ${correctHighlight}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full border font-semibold text-sm transition-colors ${
                        isSelected && !focusResultIndicator ? (isDark ? 'border-purple-400 text-purple-300 bg-purple-500/10' : 'border-purple-500 text-purple-700 bg-purple-100')
                        : (isDark ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-500')
                      }`}>{String.fromCharCode(65 + i)}</span>
                      <span className="text-lg">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit / Result Area */}
            {!focusResultIndicator ? (
              <button onClick={handleFocusSubmit} disabled={focusSelectedOption === undefined || checkingId !== null}
                className={`w-full py-4 font-bold text-lg rounded-xl transition-all duration-200 ${
                  focusSelectedOption !== undefined && checkingId === null
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg hover:shadow-purple-500/25'
                    : (isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                }`}>
                {checkingId !== null ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'Lock Answer'}
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 justify-between mt-2">
                <div className={`flex-1 flex items-center gap-3 px-6 py-4 rounded-xl border ${isDark ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  {focusResultIndicator === 'correct' ? <CheckCircle className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} /> : <XCircle className={`h-6 w-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />}
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg ${focusResultIndicator === 'correct' ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                      {focusResultIndicator === 'correct' ? 'Correct!' : 'Incorrect'}
                    </span>
                    {focusResultIndicator === 'wrong' && !isAdaptiveSequence && (
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Starting practice questions...</span>
                    )}
                    {isAdaptiveSequence && (
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{focusResultIndicator === 'correct' ? 'Moving to a harder question ↑' : 'Adjusting to an easier question ↓'}</span>
                    )}
                  </div>
                </div>
                <button onClick={handleFocusNext}
                  className={`w-full sm:w-auto px-8 py-4 font-bold text-lg rounded-xl transition-all whitespace-nowrap shadow-md ${isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  {(isAdaptiveSequence && adaptiveStage < 8 && adaptiveFailedCount < (focusResultIndicator === 'wrong' ? 3 : 4))
                    ? (focusResultIndicator === 'wrong' && adaptiveStage === 0 ? 'Continue Practice' : 'Next Question')
                    : (focusIndex < focusQuestions.length - 1 ? 'Next Question' : 'Finish Exam')}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FocusModeOverlay;
