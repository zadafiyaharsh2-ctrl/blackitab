import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Microscope,
  FlaskConical,
  BookOpen,
  Briefcase,
  Award,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import API_URL from '../config';

const Problems = () => {
  const [problemSubjects, setProblemSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch problem subjects from backend
  useEffect(() => {
    const fetchProblemSubjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/problems/subjects`);
        if (res.data.success) {
          setProblemSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching problem subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemSubjects();
  }, []);

  // Exam categories with their metadata
  const examCategories = [
    {
      id: 'jee',
      name: 'JEE (Joint Entrance Examination)',
      shortName: 'JEE',
      description: 'Master engineering entrance preparation with comprehensive Physics, Chemistry, and Mathematics problem sets',
      icon: FlaskConical,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/60',
      iconColor: 'text-purple-400',
      subjects: ['Physics', 'Chemistry', 'Mathematics'],
      stats: { problems: '500+', difficulty: 'High' }
    },
    {
      id: 'neet',
      name: 'NEET (National Eligibility Entrance Test)',
      shortName: 'NEET',
      description: 'Comprehensive medical entrance exam preparation covering Biology, Chemistry, and Physics fundamentals',
      icon: Microscope,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      hoverBorder: 'hover:border-green-500/60',
      iconColor: 'text-green-400',
      subjects: ['Biology', 'Chemistry', 'Physics'],
      stats: { problems: '450+', difficulty: 'High' }
    },
    {
      id: 'upsc',
      name: 'UPSC (Union Public Service Commission)',
      shortName: 'UPSC',
      description: 'Civil services examination practice with comprehensive coverage of General Studies and optional subjects',
      icon: Award,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500/60',
      iconColor: 'text-blue-400',
      subjects: ['General Studies', 'Current Affairs', 'Essay'],
      stats: { problems: '300+', difficulty: 'Expert' }
    },
    {
      id: 'gate',
      name: 'GATE (Graduate Aptitude Test in Engineering)',
      shortName: 'GATE',
      description: 'Technical aptitude and engineering knowledge assessment for postgraduate admissions and PSU recruitment',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-500/60',
      iconColor: 'text-orange-400',
      subjects: ['Core Engineering', 'Aptitude', 'Mathematics'],
      stats: { problems: '400+', difficulty: 'High' }
    },
    {
      id: 'cat',
      name: 'CAT (Common Admission Test)',
      shortName: 'CAT',
      description: 'MBA entrance examination covering Quantitative Ability, Verbal Ability, and Logical Reasoning',
      icon: Briefcase,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      hoverBorder: 'hover:border-pink-500/60',
      iconColor: 'text-pink-400',
      subjects: ['Quantitative Ability', 'Verbal Ability', 'Logical Reasoning'],
      stats: { problems: '350+', difficulty: 'Medium' }
    },
    {
      id: 'general',
      name: 'General Problem Solving',
      shortName: 'General',
      description: 'Enhance your problem-solving skills with diverse topics including Data Structures and Algorithms',
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      hoverBorder: 'hover:border-teal-500/60',
      iconColor: 'text-teal-400',
      subjects: ['All Subjects'],
      stats: { problems: 'All', difficulty: 'Varied' }
    }
  ];

  // Handle exam category click
  const handleExamClick = (examId) => {

    if (examId === 'general') {
      if (problemSubjects.length > 0)
        navigate(`/problems/${problemSubjects[0]._id}`);
    } else {
      navigate(`/exam/${examId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent transition-colors">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-gray-100 to-blue-50 dark:from-purple-900/20 dark:via-gray-900/50 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-medium">Master Your Exam Preparation</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Practice. Perfect. <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Succeed.</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Comprehensive problem sets tailored for India's most competitive exams. 
              Build confidence with structured practice and detailed solutions.
            </p>

            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">1000+ Problems</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Multiple Exams</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-300 dark:border-gray-700">
                <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Track Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Exam Categories Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Your Exam Category</h2>
          <p className="text-gray-600 dark:text-gray-400">Select the exam you're preparing for and start solving problems</p>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examCategories.map((exam) => {
            const Icon = exam.icon;
            return (
              <div
                key={exam.id}
                onClick={() => handleExamClick(exam.id)}
                className={`group relative bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border ${exam.borderColor} ${exam.hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1`}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${exam.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className="relative p-6">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-14 w-14 ${exam.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`${exam.iconColor} h-7 w-7`} />
                    </div>

                    <div className="px-3 py-1 bg-gray-700/50 rounded-full">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{exam.stats.difficulty}</span>
                    </div>
                  </div>

                  {/* Exam Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                    {exam.shortName}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {exam.description}
                  </p>

                  {/* Subjects */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {exam.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md border border-gray-600/50"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700/50">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {exam.stats.problems} Problems
                    </span>

                    <div className={`flex items-center gap-1 ${exam.iconColor} font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300`}>
                      Start Practice
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Not sure where to start?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try our General Problem Solving section with diverse topics</p>
            <button
              onClick={() => handleExamClick('general')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-gray-900 dark:text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
            >
              Explore All Problems
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problems;
