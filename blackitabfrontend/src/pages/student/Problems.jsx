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
  Target,
  Building2,
  Globe
} from 'lucide-react';
import API_URL from '../../config';
import usePageTitle from '../../hooks/usePageTitle';
import PageShimmer from '../../components/shared/PageShimmer';

const Problems = () => {
  usePageTitle('Practice Problems');
  const [globalExams, setGlobalExams] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'institute'
  const [instituteExams, setInstituteExams] = useState([]);
  const [instituteLoading, setInstituteLoading] = useState(false);
  const navigate = useNavigate();

  // Get user data to check if in an institute
  const userDataStr = localStorage.getItem('user');
  const user = userDataStr ? JSON.parse(userDataStr) : null;
  const hasInstitute = !!(user?.instituteId);

  // Fetch global exam list from backend (fully data-driven, no dummy tabs)
  useEffect(() => {
    const fetchGlobalExams = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/problems/global-subjects`);
        if (res.data.success) {
          setGlobalExams(Array.isArray(res.data.data) ? res.data.data : []);
        }
      } catch (err) {
        console.error('Error fetching global exam list:', err);
      } finally {
        setGlobalLoading(false);
      }
    };

    fetchGlobalExams();
  }, []);

  // Fetch institute exams when switching to institute tab
  useEffect(() => {
    if (activeTab === 'institute' && hasInstitute) {
      const fetchInstituteExams = async () => {
        setInstituteLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/api/problems/institute-subjects`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setInstituteExams(res.data.data);
          }
        } catch (err) {
          console.error('Error fetching institute exams:', err);
        } finally {
          setInstituteLoading(false);
        }
      };
      fetchInstituteExams();
    }
  }, [activeTab, hasInstitute]);

  const examMetaById = {
    jee: {
      shortName: 'JEE',
      description: 'Master engineering entrance preparation with comprehensive Physics, Chemistry, and Mathematics problem sets',
      icon: FlaskConical,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/60',
      iconColor: 'text-purple-400'
    },
    neet: {
      shortName: 'NEET',
      description: 'Comprehensive medical entrance exam preparation covering Biology, Chemistry, and Physics fundamentals',
      icon: Microscope,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      hoverBorder: 'hover:border-green-500/60',
      iconColor: 'text-green-400'
    },
    upsc: {
      shortName: 'UPSC',
      description: 'Civil services examination practice with comprehensive coverage of General Studies and optional subjects',
      icon: Award,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      hoverBorder: 'hover:border-blue-500/60',
      iconColor: 'text-blue-400'
    },
    gate: {
      shortName: 'GATE',
      description: 'Technical aptitude and engineering knowledge assessment for postgraduate admissions and PSU recruitment',
      icon: Target,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      hoverBorder: 'hover:border-orange-500/60',
      iconColor: 'text-orange-400'
    },
    cat: {
      shortName: 'CAT',
      description: 'MBA entrance examination covering Quantitative Ability, Verbal Ability, and Logical Reasoning',
      icon: Briefcase,
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      hoverBorder: 'hover:border-pink-500/60',
      iconColor: 'text-pink-400'
    }
  };

  const getExamMeta = (examId) => {
    const normalized = String(examId || '').toLowerCase();
    const fallbackName = normalized ? normalized.toUpperCase() : 'EXAM';
    return examMetaById[normalized] || {
      shortName: fallbackName,
      description: `${fallbackName} preparation questions from the problem bank`,
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      hoverBorder: 'hover:border-teal-500/60',
      iconColor: 'text-teal-400'
    };
  };

  // Handle exam category click
  const handleExamClick = (examId, source = 'global') => {
    if (source === 'institute') {
      navigate(`/exam/${examId}/institute`);
    } else {
      navigate(`/exam/${examId}`);
    }
  };

  if (globalLoading) return <PageShimmer variant="cards" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-gray-100 to-blue-50 dark:from-purple-900/20 dark:via-black/50 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">Master Your Exam Preparation</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Practice. Perfect. <span className="bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">Succeed.</span>
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
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
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-black via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* Tab Bar + Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Tab Bar — only show if user has institute */}
        {hasInstitute && (
          <div className="flex items-center gap-2 mb-10 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'global'
                  ? 'bg-white dark:bg-gray-700 text-purple-700 dark:text-purple-300 shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Globe className="w-4 h-4" />
              Global Problems
            </button>
            <button
              onClick={() => setActiveTab('institute')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'institute'
                  ? 'bg-white dark:bg-gray-700 text-orange-700 dark:text-orange-300 shadow-sm border border-gray-200 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Institute Questions
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'global' ? (
          <>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Your Exam Category</h2>
              <p className="text-gray-600 dark:text-gray-400">These categories are loaded from the live global problem bank</p>
            </div>

            {/* Exam Cards Grid */}
            {globalExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {globalExams.map((examEntry) => {
                  const examId = typeof examEntry === 'string' ? examEntry : examEntry.exam;
                  const examMeta = getExamMeta(examId);
                  const Icon = examMeta.icon;
                  const subjects = Array.isArray(examEntry?.subjects) && examEntry.subjects.length > 0
                    ? examEntry.subjects
                    : ['All Subjects'];
                  const questionCount = Number(examEntry?.questionCount) || 0;

                return (
                  <div
                    key={examId}
                    onClick={() => handleExamClick(examId, 'global')}
                    className={`group relative bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border ${examMeta.borderColor} ${examMeta.hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1`}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${examMeta.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                    <div className="relative p-6">
                      {/* Icon and Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`h-14 w-14 ${examMeta.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`${examMeta.iconColor} h-7 w-7`} />
                        </div>

                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full border border-gray-300 dark:border-gray-600/50">
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Live</span>
                        </div>
                      </div>

                      {/* Exam Name */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all">
                        {examMeta.shortName}
                      </h3>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {examMeta.description}
                      </p>

                      {/* Subjects */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600/50"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700/50">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {questionCount} Questions
                        </span>

                        <div className={`flex items-center gap-1 ${examMeta.iconColor} font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300`}>
                          Start Practice
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Globe className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No global categories available yet</p>
                <p className="text-gray-500 text-sm">Global questions need to be published before categories appear here.</p>
              </div>
            )}
          </>
        ) : (
          /* Institute Questions Tab */
          <>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-orange-500" />
                Institute Questions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Practice questions created by your institute's teachers</p>
            </div>

            {instituteLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 rounded-full"></div>
              </div>
            ) : instituteExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instituteExams.map((examId) => {
                  const examMeta = getExamMeta(examId);
                  const Icon = examMeta.icon;
                  const shortName = examMeta.shortName;
                  const bgColor = examMeta.bgColor;
                  const iconColor = examMeta.iconColor;
                  const borderColor = examMeta.borderColor;
                  const hoverBorder = examMeta.hoverBorder;

                  return (
                    <div
                      key={examId}
                      onClick={() => handleExamClick(examId, 'institute')}
                      className={`group relative bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border ${borderColor} ${hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/5 group-hover:to-amber-500/5 transition-opacity duration-300"></div>

                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`h-14 w-14 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className={`${iconColor} h-7 w-7`} />
                          </div>
                          <div className="px-3 py-1 bg-orange-100 dark:bg-orange-500/10 rounded-full border border-orange-200 dark:border-orange-500/20">
                            <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Institute</span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {shortName}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Practice {shortName} questions curated by your institute
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-300 dark:border-gray-700/50">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Institute Exclusive
                          </span>
                          <div className={`flex items-center gap-1 text-orange-500 font-semibold text-sm group-hover:translate-x-1 transition-transform duration-300`}>
                            Start Practice
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Building2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No institute questions available yet</p>
                <p className="text-gray-500 text-sm">Your institute teachers haven't added any questions to the problem bank yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Problems;
