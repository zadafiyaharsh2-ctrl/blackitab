import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaBookOpen, FaQuestionCircle, FaSearch, FaUser, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import PageShimmer from '../../components/shared/PageShimmer';
import toast from 'react-hot-toast';

const HodContentReview = () => {
  const [activeTab, setActiveTab] = useState('theories');
  const [theories, setTheories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchContent(); }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/department/content').catch(() => ({ data: { success: true, data: { theories: [], questions: [] } } }));
      if (res.data.success) {
        const d = res.data.data;
        setTheories(d.theories || d.content || []);
        setQuestions(d.questions || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };


  const getBadge = (s) => {
    const cls = s === 'approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      : s === 'rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'
      : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20';
    return <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${cls}`}>{s || 'pending'}</span>;
  };

  const filteredT = theories.filter(t => (t.title||'').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredQ = questions.filter(q => (q.questionText||q.question||'').toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <PageShimmer variant="list" />;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#05000a] text-gray-900 dark:text-white p-6 sm:p-10 font-sans transition-colors selection:bg-[#0061FF]/20 selection:text-gray-900">
      
      <div className="max-w-[80rem] mx-auto space-y-10">
        
        {/* Header & Master KPI Segment */}
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between border-b border-gray-200 dark:border-white/10 pb-8">
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full mb-4 shadow-sm">
              <FaBookOpen className="text-[#0061FF] dark:text-[#a5c3ff] text-xs" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Department Content QA
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              Content Review
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-3 max-w-xl leading-relaxed">
              Evaluate instructional theories and assessment questions submitted by your faculty. Ensure academic standards are met before publication.
            </p>
          </div>

          {/* KPI Dashboard */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Theories', value: theories.length, color: 'text-[#0061FF]' },
              { label: 'Total Questions', value: questions.length, color: 'text-emerald-500' },
              { label: 'Pending Theories', value: theories.filter(t => !t.status || t.status === 'pending').length, color: 'text-amber-500' },
              { label: 'Pending Questions', value: questions.filter(q => !q.status || q.status === 'pending').length, color: 'text-amber-500' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px] group transition-all hover:border-[#0061FF]/30">
                <div className={`text-3xl font-black tracking-tighter mb-1.5 transition-transform group-hover:scale-105 ${kpi.color}`}>
                  {kpi.value}
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls: Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-white/[0.02] p-2 pr-6 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm sticky top-6 z-10 backdrop-blur-md">
          
          {/* Segmented Controls (Tabs) */}
          <div className="flex-shrink-0 bg-gray-50 dark:bg-black/50 p-1.5 rounded-[1.5rem] flex w-full md:w-auto">
            {['theories', 'questions'].map(tab => {
              const isActive = activeTab === tab;
              const isTheories = tab === 'theories';
              const activeColor = isTheories ? 'bg-[#0061FF] text-white' : 'bg-emerald-500 text-white';
              const textFocus = isTheories ? 'focus:ring-[#0061FF]/30' : 'focus:ring-emerald-500/30';
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all focus:outline-none focus:ring-2 whitespace-nowrap ${textFocus} ${
                    isActive
                      ? `${activeColor} shadow-md`
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                  }`}
                >
                  {isTheories ? <FaBookOpen className="text-[10px]" /> : <FaQuestionCircle className="text-[10px]" />}
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none py-3 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>
        </div>

        {/* Content List Area */}
        <div className="min-h-[400px]">
          {(activeTab === 'theories' ? filteredT : filteredQ).length === 0 ? (
            <div className="text-center py-24 px-6 bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] shadow-sm max-w-3xl mx-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                {activeTab === 'theories' ? <FaBookOpen className="text-3xl text-gray-300 dark:text-gray-600" /> : <FaQuestionCircle className="text-3xl text-gray-300 dark:text-gray-600" />}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Found</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? `We couldn't find any ${activeTab} matching "${searchQuery}". Try modifying your search.`
                  : `There are currently no ${activeTab} submitted for review in this department.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activeTab === 'theories' ? filteredT : filteredQ).map(item => (
                <div 
                  key={item._id} 
                  className="group bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#0061FF]/30 dark:hover:border-[#0061FF]/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 flex flex-col md:flex-row gap-6 items-start"
                >
                  
                  {/* Left Column: Icon/Status Placeholder */}
                  <div className="hidden md:flex flex-col items-center justify-start flex-shrink-0 pt-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner border max-w-full ${
                      activeTab === 'theories' 
                        ? 'bg-blue-50 text-[#0061FF] border-blue-100 dark:bg-[#0061FF]/10 dark:text-[#a5c3ff] dark:border-[#0061FF]/20' 
                        : 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    }`}>
                       {activeTab === 'theories' ? <FaBookOpen className="text-lg" /> : <FaQuestionCircle className="text-lg" />}
                    </div>
                  </div>

                  {/* Main Content Column */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {getBadge(item.status)}
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <FaUser className="text-[10px]" />
                        <span className="truncate max-w-[150px]">{item.createdBy?.name || 'Unknown Author'}</span>
                      </div>
                      
                      <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <FaClock className="text-[10px]" />
                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                       <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-snug group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors line-clamp-2 text-balance">
                        {item.title || item.questionText || item.question || 'Untitled Content'}
                      </h4>
                      {item.description && (
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed max-w-4xl">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Interaction Hint (Optional) */}
                    <div className="mt-6 flex items-center justify-between sm:justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[10px] font-black uppercase tracking-widest text-[#0061FF] hover:text-[#004bcc] dark:hover:text-[#a5c3ff] flex items-center gap-1 transition-colors">
                        Review Details <FaArrowRight />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HodContentReview;
