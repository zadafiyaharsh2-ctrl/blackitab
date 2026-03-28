import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FaList, FaPlus, FaRobot, FaFilePdf } from 'react-icons/fa';
import usePageTitle from '../../hooks/usePageTitle';
import { useTheme } from '../../context/ThemeContext';

// Import newly created tab components
import MyBankTab from '../../components/teacher/tabs/MyBankTab';
import CreateTab from '../../components/teacher/tabs/CreateTab';
import AIGeneratorTab from '../../components/teacher/tabs/AIGeneratorTab';
import GeneratePaperTab from '../../components/teacher/tabs/GeneratePaperTab';

const ManageQuestions = () => {
  usePageTitle('Question Bank');
  const { isDark } = useTheme();

  // Tabs: 'my-bank', 'create', 'ai', 'paper'
  const [activeTab, setActiveTab] = useState('my-bank');

  return (
    <div className={`min-h-screen relative p-4 sm:p-8 lg:p-12 font-sans transition-colors ${
      isDark ? 'bg-[#05000a] text-gray-100' : 'bg-[#f8f9fa] text-gray-900'
    } overflow-x-hidden pt-24`}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Curated Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8 border-gray-200 dark:border-white/10">
          <div>
            <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Question Intelligence
            </h1>
            <p className={`text-base font-medium mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage and curate your scholarly assessments within the grand registry.
            </p>
          </div>

          {/* Segmented Control - Pill Style */}
          <div className={`inline-flex p-1.5 rounded-full ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
            <button onClick={() => setActiveTab('my-bank')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'my-bank'
                  ? 'bg-[#0061FF] text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              My Bank
            </button>
            <button onClick={() => setActiveTab('create')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'create'
                  ? 'bg-[#0061FF] text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              Manual
            </button>
            <button onClick={() => setActiveTab('ai')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#0061FF] text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              AI Gen
            </button>
            <button onClick={() => setActiveTab('paper')}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                activeTab === 'paper'
                  ? 'bg-[#0061FF] text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}>
              Papers
            </button>
          </div>
        </div>

        {/* Dynamic Canvas */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AnimatePresence mode="wait">
            {activeTab === 'my-bank' && <MyBankTab key="my-bank" isDark={isDark} />}
            {activeTab === 'create' && <CreateTab key="create" isDark={isDark} setActiveTab={setActiveTab} />}
            {activeTab === 'ai' && <AIGeneratorTab key="ai" isDark={isDark} />}
            {activeTab === 'paper' && <GeneratePaperTab key="paper" isDark={isDark} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;
