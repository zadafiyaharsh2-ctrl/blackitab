import React from 'react';
import { Award, CheckCircle, Brain, Zap } from 'lucide-react';

const StudentStrengthsWeaknesses = ({ strengths, resolvedFocusAreas }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-gray-200 dark:border-emerald-500/20 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Award className="h-3.5 w-3.5 text-emerald-500" /> Core Strengths
        </h3>
        {strengths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {strengths.map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 py-6">Solve above 75% accuracy to reveal strengths.</p>
        )}
      </div>

      <div className="border border-gray-200 dark:border-red-500/20 rounded-xl p-5 bg-white dark:bg-white/[0.02]">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
          <Brain className="h-3.5 w-3.5 text-red-500" /> Focus Areas
        </h3>
        {resolvedFocusAreas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resolvedFocusAreas.map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-2.5 border border-gray-100 dark:border-white/5 rounded-lg">
                <Zap className="h-4 w-4 text-red-500 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 py-6">Attempt harder problems to identify weak points.</p>
        )}
      </div>
    </div>
  );
};

export default StudentStrengthsWeaknesses;
