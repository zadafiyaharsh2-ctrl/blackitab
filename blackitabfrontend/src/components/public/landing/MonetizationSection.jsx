import React from 'react';

const MonetizationSection = () => (
  <div className="max-w-7xl mx-auto mb-24">
    <div className="rounded-3xl p-8 md:p-12 border transition-colors bg-white border-gray-200 shadow-sm">
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
          Educator Monetization Models
        </h2>
        <p className="text-sm tracking-wide text-gray-500">
          Deploy your courses freely or natively monetize via strict paywalls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Option 1: Paid Courses */}
        <div className="p-8 rounded-2xl border transition-colors bg-[#f8f9fa] border-gray-100">
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-widest font-black text-[#0061FF] mb-2 block">Direct Revenue</span>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">
              Premium Licensing
            </h3>
          </div>
          <ul className="text-sm space-y-4 font-medium text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0061FF] mt-1.5 shrink-0" />
              <span><strong className="text-gray-800">Set Independent Pricing:</strong> Retain full control over licensing costs—structure it as flat rate or tier access.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0061FF] mt-1.5 shrink-0" />
              <span><strong className="text-gray-800">Immediate ROI:</strong> Receive payouts with zero intermediary delay. Target specialized professionals.</span>
            </li>
          </ul>
        </div>

        {/* Option 2: Free Content with Ads */}
        <div className="p-8 rounded-2xl border transition-colors bg-[#f8f9fa] border-gray-100">
          <div className="mb-6">
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-500 mb-2 block">Ad-Supported</span>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-gray-900">
              Ad-Share Delivery
            </h3>
          </div>
          <ul className="text-sm space-y-4 font-medium text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span><strong className="text-gray-800">Limitless Reach:</strong> Bypass paywalls entirely to scale distribution to millions of low-barrier students.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <span><strong className="text-gray-800">Automated RPM Share:</strong> Revenue streams dynamically calculate based on dwell times and strict metric tracking.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default MonetizationSection;
