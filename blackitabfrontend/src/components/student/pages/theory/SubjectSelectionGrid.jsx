import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';

const SubjectSelectionGrid = ({ subjects, completedTopics, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {subjects.map((subject) => {
        const completedCount = Object.keys(completedTopics[subject._id] || {}).length;
        const totalTopics = subject.topicCount || 0;
        const progressPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

        return (
          <div
            key={subject._id}
            onClick={() => navigate(`/theory/${subject._id}`)}
            className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl cursor-pointer p-6 border border-gray-300 dark:border-gray-700 group transition hover:border-blue-500/30"
          >
            <div className="h-14 w-14 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
              <BookOpen className="text-blue-400 group-hover:text-gray-900 dark:text-white h-8 w-8" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{subject.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{subject.description}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {completedCount}/{totalTopics} topics completed
                </span>
                <span className="text-blue-400 font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center text-blue-400 mt-5 font-semibold group-hover:text-blue-300">
              {completedCount > 0 ? 'Continue Learning' : 'Start Learning'} <ChevronRight className="ml-2 h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubjectSelectionGrid;
