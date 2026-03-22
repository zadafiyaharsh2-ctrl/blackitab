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
    },
    neet: {
      shortName: 'NEET',
      description: 'Comprehensive medical entrance exam preparation covering Biology, Chemistry, and Physics fundamentals',
      icon: Microscope,
    },
    upsc: {
      shortName: 'UPSC',
      description: 'Civil services examination practice with comprehensive coverage of General Studies and optional subjects',
      icon: Award,
    },
    gate: {
      shortName: 'GATE',
      description: 'Technical aptitude and engineering knowledge assessment for postgraduate admissions and PSU recruitment',
      icon: Target,
    },
    cat: {
      shortName: 'CAT',
      description: 'MBA entrance examination covering Quantitative Ability, Verbal Ability, and Logical Reasoning',
      icon: Briefcase,
    }
  };

  const getExamMeta = (examId) => {
    const normalized = String(examId || '').toLowerCase();
    const fallbackName = normalized ? normalized.toUpperCase() : 'EXAM';
    return examMetaById[normalized] || {
      shortName: fallbackName,
      description: `${fallbackName} preparation questions from the problem bank`,
      icon: BookOpen,
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
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] transition-colors font-sans overflow-x-hidden">
      
      {/* Editorial Hero Section */}
      <div className="relative pt-20 pb-12 md:pt-32 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-start border-b border-gray-200 dark:border-white/10">
        
        {/* Decorative subtle background bloat (strictly tonal, no gamified neons) */}
        <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-l from-[#0061FF]/[0.02] to-transparent dark:from-[#0061FF]/[0.05] pointer-events-none rounded-bl-full blur-3xl -z-10" />

        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-8 shadow-sm">
          <TrendingUp className="w-4 h-4 text-[#0061FF] dark:text-[#a5c3ff]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
            Intensive Problem Bank
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight max-w-3xl">
          Master Your Practice.
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl font-medium">
          Choose your path to excellence. Curated problem sets intentionally designed to test depth, accuracy, and endurance.
        </p>

        <div className="flex flex-wrap gap-4 text-sm font-semibold tracking-wide">
          <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="h-2 w-2 bg-[#0061FF] rounded-full animate-pulse"></div>
            <span className="text-gray-700 dark:text-gray-300">10,000+ Verified Problems</span>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="h-2 w-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Expert Curated Exams</span>
          </div>
        </div>
      </div>

      {/* Tab Bar + Content Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">

        {/* Tab Navigation */}
        {hasInstitute && (
          <div className="flex items-center gap-2 mb-12 p-1.5 bg-white dark:bg-white-[0.02] rounded-xl border border-gray-200 dark:border-white/10 w-fit shadow-sm">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wide transition-all ${
                activeTab === 'global'
                  ? 'bg-[#f8f9fa] dark:bg-white/10 text-[#0061FF] dark:text-[#a5c3ff] shadow-sm border border-gray-200 dark:border-transparent'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Global Problems
            </button>
            <button
              onClick={() => setActiveTab('institute')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-lg font-bold text-[13px] uppercase tracking-wide transition-all ${
                activeTab === 'institute'
                  ? 'bg-[#f8f9fa] dark:bg-white/10 text-[#0061FF] dark:text-[#a5c3ff] shadow-sm border border-gray-200 dark:border-transparent'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Institute Directory
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'global' ? (
          <>
            {/* Minimal Section Header (if needed, but usually incorporated naturally) */}
            <div className="mb-8 hidden">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Global Directory</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Publicly sourced and verified examinations.</p>
            </div>

            {/* Exam Cards Grid */}
            {globalExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {globalExams.map((examEntry) => {
                  const examId = typeof examEntry === 'string' ? examEntry : examEntry.exam;
                  const examMeta = getExamMeta(examId);
                  const Icon = examMeta.icon;
                  const subjects = Array.isArray(examEntry?.subjects) && examEntry.subjects.length > 0
                    ? examEntry.subjects
                    : ['General'];
                  const questionCount = Number(examEntry?.questionCount) || 0;

                return (
                  <div
                    key={examId}
                    onClick={() => handleExamClick(examId, 'global')}
                    className="group flex flex-col bg-white dark:bg-white/[0.02] rounded-[1.5rem] border border-gray-200 dark:border-white/10 p-8 transition-all duration-300 cursor-pointer hover:border-[#0061FF]/40 dark:hover:border-white/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none hover:-translate-y-1 relative overflow-hidden"
                  >
                    
                    {/* Hover Glow (Tonal) */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0061FF]/5 dark:bg-[#0061FF]/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />

                    {/* Icon and Live Badge */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="h-14 w-14 rounded-2xl bg-[#f8f9fa] dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:bg-[#0061FF]/5 dark:group-hover:bg-[#0061FF]/20 transition-colors duration-300">
                        <Icon className="text-[#0061FF] dark:text-[#a5c3ff] h-6 w-6" />
                      </div>

                      <div className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Live</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">
                      {examMeta.shortName}
                    </h3>

                    <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium flex-grow">
                      {examMeta.description}
                    </p>

                    {/* Tags */}
                    <div className="mb-8 flex flex-wrap gap-2">
                      {subjects.slice(0, 3).map((subject, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#f8f9fa] dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-white/10"
                        >
                          {subject}
                        </span>
                      ))}
                      {subjects.length > 3 && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#f8f9fa] dark:bg-white/5 text-gray-500 rounded-lg border border-gray-200 dark:border-white/10">
                          +{subjects.length - 3} More
                        </span>
                      )}
                    </div>

                    {/* Footer / Action */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10 mt-auto">
                      <span className="text-[13px] font-bold tracking-wide text-gray-400 dark:text-gray-500">
                        {questionCount} Questions
                      </span>

                      <div className="flex items-center gap-1 text-[#0061FF] dark:text-[#a5c3ff] font-bold text-[13px] tracking-wide group-hover:translate-x-1.5 transition-transform duration-300">
                        Start Practice
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-white dark:bg-white/[0.02] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm">
                <Globe className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                <p className="text-gray-900 dark:text-white text-xl font-bold tracking-tight mb-2">No global categories active</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">Global questions need to be officially verified and published before categories populate here.</p>
              </div>
            )}
          </>
        ) : (
          /* Institute Questions Tab */
          <>
            {instituteLoading ? (
              <div className="flex justify-center py-32">
                <div className="animate-spin h-10 w-10 border-4 border-gray-200 border-t-[#0061FF] rounded-full"></div>
              </div>
            ) : instituteExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {instituteExams.map((examId) => {
                  const examMeta = getExamMeta(examId);
                  const Icon = examMeta.icon;
                  const shortName = examMeta.shortName;

                  return (
                    <div
                      key={examId}
                      onClick={() => handleExamClick(examId, 'institute')}
                      className="group flex flex-col bg-white dark:bg-white/[0.02] rounded-[1.5rem] border border-gray-200 dark:border-white/10 p-8 transition-all duration-300 cursor-pointer hover:border-[#0061FF]/40 dark:hover:border-white/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none hover:-translate-y-1 relative overflow-hidden"
                    >
                      
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0061FF]/5 dark:bg-[#0061FF]/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />

                      <div className="flex items-start justify-between mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-[#f8f9fa] dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:bg-[#0061FF]/5 dark:group-hover:bg-[#0061FF]/20 transition-colors duration-300">
                          <Icon className="text-[#0061FF] dark:text-[#a5c3ff] h-6 w-6" />
                        </div>
                        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-md border border-indigo-100 dark:border-indigo-500/20">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0061FF] dark:text-[#a5c3ff]">Institute</span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">
                        {shortName}
                      </h3>

                      <p className="text-[15px] text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-medium flex-grow">
                        Practice {shortName} questions exclusively curated and published by your institute's active administration.
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10 mt-auto">
                        <span className="text-[13px] font-bold tracking-wide text-gray-400 dark:text-gray-500">
                          Private Directory
                        </span>
                        <div className="flex items-center gap-1 text-[#0061FF] dark:text-[#a5c3ff] font-bold text-[13px] tracking-wide group-hover:translate-x-1.5 transition-transform duration-300">
                          Start Practice
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-white dark:bg-white/[0.02] rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm">
                <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                <p className="text-gray-900 dark:text-white text-xl font-bold tracking-tight mb-2">No institute questions available</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">Your institute teachers haven't curated any custom exams into the problem bank yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Problems;
