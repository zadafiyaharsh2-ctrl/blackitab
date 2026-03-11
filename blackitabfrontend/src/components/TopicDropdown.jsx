/**
 * ============================================================================
 * TOPIC DROPDOWN COMPONENT
 * ============================================================================
 * 
 * A compact dropdown menu placed at the top of the Theory content area.
 * Replaces the old right-sidebar topic list. Shows the currently selected
 * topic name and allows users to switch topics via a dropdown menu.
 * 
 * Props:
 * - topics: Array of topic objects [{_id, name, subjectId}]
 * - selectedTopic: Currently selected topic object
 * - onSelectTopic: Callback when user picks a topic
 * - subjectName: Name of current subject
 * - onBackToSubjects: Callback to go back to subject selection
 * - completedTopics: Object mapping topicId → completion status
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopicDropdown = ({
    topics,
    selectedTopic,
    onSelectTopic,
    subjectName,
    onBackToSubjects,
    completedTopics
}) => {
    const { isDark } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, []);

    const completedCount = Object.keys(completedTopics || {}).filter(
        id => completedTopics[id] === true
    ).length;

    const currentIndex = topics.findIndex(t => t._id === selectedTopic?._id);

    return (
        <div className="flex items-center gap-3 flex-wrap" ref={dropdownRef}>
            {/* Back Button */}
            <button
                onClick={onBackToSubjects}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
          text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
          hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="Back to Subjects"
            >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{subjectName}</span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Topic Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            border ${isOpen
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-md'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-400 hover:shadow-sm'
                        }`}
                >
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="max-w-[200px] truncate">{selectedTopic?.name || 'Select Topic'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                        {currentIndex + 1}/{topics.length}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className={`absolute top-full left-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl shadow-xl border z-50
              ${isDark
                            ? 'bg-gray-800 border-gray-700'
                            : 'bg-white border-gray-200'
                        } custom-scrollbar`}
                    >
                        {/* Header */}
                        <div className={`sticky top-0 px-4 py-2.5 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Topics
                                </span>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {completedCount}/{topics.length} completed
                                </span>
                            </div>
                        </div>

                        {/* Topic List */}
                        <div className="py-1">
                            {topics.map((topic, index) => {
                                const isSelected = selectedTopic?._id === topic._id;
                                const isCompleted = completedTopics?.[topic._id] === true;

                                return (
                                    <button
                                        key={topic._id}
                                        onClick={() => {
                                            onSelectTopic(topic);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all text-sm
                      ${isSelected
                                                ? isDark
                                                    ? 'bg-blue-900/30 text-blue-400 border-l-3 border-blue-500'
                                                    : 'bg-blue-50 text-blue-700 border-l-3 border-blue-500'
                                                : isDark
                                                    ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {/* Number */}
                                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isSelected
                                                ? 'bg-blue-600 text-white'
                                                : isCompleted
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                    : isDark
                                                        ? 'bg-gray-700 text-gray-400'
                                                        : 'bg-gray-100 text-gray-500'
                                            }`}
                                        >
                                            {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                                        </span>

                                        {/* Topic Name */}
                                        <span className="truncate flex-1 font-medium">{topic.name}</span>

                                        {/* Current indicator */}
                                        {isSelected && (
                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${topics.length > 0 ? (completedCount / topics.length) * 100 : 0}%` }}
                    />
                </div>
                <span>{completedCount}/{topics.length}</span>
            </div>
        </div>
    );
};

export default TopicDropdown;
