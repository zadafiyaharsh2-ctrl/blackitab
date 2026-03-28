import React from 'react';

const StudentHeader = ({ userName }) => {
  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl px-5 py-6 bg-white dark:bg-white/[0.02]">
      <p className="text-sm text-gray-500 dark:text-gray-400">Student dashboard</p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
        Hey, {userName}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Here is your progress at a glance.
      </p>
    </div>
  );
};

export default StudentHeader;
