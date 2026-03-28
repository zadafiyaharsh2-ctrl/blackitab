import React from 'react';

const AnalyticsSection = () => (
  <div className="max-w-7xl mx-auto mb-24">
    <div className="rounded-3xl p-8 md:p-12 border transition-colors bg-white border-gray-200 shadow-sm">
      <div className="flex flex-col mb-12">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
          Intelligent Analytics for Teachers
        </h2>
        <p className="text-sm tracking-wide text-gray-500">
          A continuous feedback loop that automatically isolates student friction points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Step 1 */}
        <div className="flex gap-5">
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
              01
            </div>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
              AI Analyzes Mistakes
            </h3>
            <p className="text-sm leading-relaxed font-medium text-gray-500">
              Our AI tracks errors across assignments, parsing patterns to identify exactly where concepts break down for cohorts.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-5">
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
              02
            </div>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
              Detailed Micro-Reports
            </h3>
            <p className="text-sm leading-relaxed font-medium text-gray-500">
              Access comprehensive metrics highlighting topics with the highest error rates and specific misconception triggers.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-5">
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
              03
            </div>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
              Automated Content Suggestions
            </h3>
            <p className="text-sm leading-relaxed font-medium text-gray-500">
              Based on gaps, the platform proactively recommends exact subtopics to inject into your coursework.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-5">
          <div className="shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono border bg-gray-100 border-gray-200 text-gray-900">
              04
            </div>
          </div>
          <div>
            <h3 className="font-bold tracking-tight text-lg mb-2 text-gray-900">
              Continuous Maturation
            </h3>
            <p className="text-sm leading-relaxed font-medium text-gray-500">
              Monitor iterative improvements as your content evolves aligned exactly to measured student needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsSection;
