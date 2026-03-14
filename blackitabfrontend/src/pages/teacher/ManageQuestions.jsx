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
    <div className={`min-h-screen relative p-3 sm:p-4 md:p-8 lg:p-10 font-sans transition-colors ${
      isDark ? 'text-gray-100 bg-[#05000a]' : 'text-gray-900 bg-gray-50'
    } overflow-x-hidden pt-20`}>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Question Management
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your question bank, create new ones, or use AI generation.
            </p>
          </div>

          <div className={`flex w-full md:w-auto flex-wrap p-1 rounded-xl glass-panel ${isDark ? 'border-white/10' : 'border-gray-200 shadow-sm'}`}>
            <button onClick={() => setActiveTab('my-bank')}
              className={`min-w-0 flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'my-bank'
                  ? 'bg-blue-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaList /> My Bank
            </button>
            <button onClick={() => setActiveTab('create')}
              className={`min-w-0 flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaPlus /> Create Manually
            </button>
            <button onClick={() => setActiveTab('ai')}
              className={`min-w-0 flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'ai'
                  ? 'bg-purple-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaRobot /> AI Generator
            </button>
            <button onClick={() => setActiveTab('paper')}
              className={`min-w-0 flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                activeTab === 'paper'
                  ? 'bg-rose-500 text-white shadow-md'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <FaFilePdf /> Generate Paper
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-bank' && <MyBankTab key="my-bank" isDark={isDark} />}
          {activeTab === 'create' && <CreateTab key="create" isDark={isDark} setActiveTab={setActiveTab} />}
          {activeTab === 'ai' && <AIGeneratorTab key="ai" isDark={isDark} />}
          {activeTab === 'paper' && <GeneratePaperTab key="paper" isDark={isDark} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManageQuestions;
