import React from 'react';
import { TrendingUp } from 'lucide-react';

const ProblemsHero = () => {
  return (
    <div className="relative pt-20 pb-12 md:pt-32 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-start border-b border-gray-200 dark:border-white/10">
      <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-[#0061FF]/[0.02] to-transparent dark:from-[#0061FF]/[0.05] pointer-events-none rounded-bl-full blur-3xl -z-10" />

      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-8 shadow-sm">
        <TrendingUp className="w-4 h-4 text-[#0061FF] dark:text-[#a5c3ff]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
          Intensive Problem Bank
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight max-w-3xl">
        Master Your Practice.
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl font-medium">
        Choose your path to excellence. Curated problem sets intentionally designed to test depth, accuracy, and endurance.
      </p>

      <div className="flex flex-wrap gap-4 text-sm font-semibold tracking-wide">
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="h-2 w-2 bg-[#0061FF] rounded-full animate-pulse"></div>
          <span className="text-gray-700 dark:text-gray-300">10,000+ Verified Problems</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">Expert Curated Exams</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemsHero;
