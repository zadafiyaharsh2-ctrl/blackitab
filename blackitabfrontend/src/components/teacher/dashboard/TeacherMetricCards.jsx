import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaFileAlt, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

const TeacherMetricCards = ({ dashboard }) => {
  const cards = [
    { label: 'My Batches', value: dashboard.batchCount || 0, icon: <FaUsers />, link: '/teacher/batches' },
    { label: 'Questions', value: dashboard.questionCount || 0, icon: <FaClipboardList />, link: '/question-management' },
    { label: 'Assignments', value: dashboard.assignmentCount || 0, icon: <FaFileAlt /> },
    { label: 'Exams', value: dashboard.examCount || 0, icon: <FaCalendarAlt /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, i) => {
        const Wrapper = card.link ? Link : 'div';
        const wrapperProps = card.link ? { to: card.link } : {};
        return (
          <Wrapper key={i} {...wrapperProps} className="group flex-1">
            <div className={`border border-gray-200 dark:border-white/10 rounded-[1.5rem] bg-white dark:bg-white/[0.02] p-6 lg:p-8 transition-all duration-300 ${card.link ? 'cursor-pointer hover:border-[#0061FF]/40 dark:hover:border-[#a5c3ff]/40 hover:-translate-y-1 hover:shadow-sm' : 'cursor-default'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[#f8f9fa] dark:bg-white/5 border border-gray-100 dark:border-transparent flex items-center justify-center group-hover:bg-[#0061FF]/5 dark:group-hover:bg-[#0061FF]/20 transition-colors">
                  <div className="text-xl text-[#0061FF] dark:text-[#a5c3ff]">{card.icon}</div>
                </div>
                {card.link && <FaChevronRight className="text-gray-300 dark:text-gray-600 text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none mb-1 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{card.value}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
};

export default TeacherMetricCards;
