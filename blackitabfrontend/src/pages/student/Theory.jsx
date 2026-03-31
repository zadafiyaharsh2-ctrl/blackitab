/**
 * THEORY PAGE COMPONENT
 *
 * Flow:
 *  View 1 — Subject Selection  (no selectedSubject)
 *  View 2 — Topic Roadmap      (selectedSubject + no selectedTopic)
 *  View 3 — Topic Content      (selectedSubject + selectedTopic)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowRight, ArrowLeft, Zap, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import AskAISidebar from '../../components/shared/AskAISidebar';
import API_URL from '../../config';
import { useTheme } from '../../context/ThemeContext';
import SubjectSelectionGrid from '../../components/student/pages/theory/SubjectSelectionGrid';
import ContentBlockRenderer from '../../components/student/pages/theory/ContentBlockRenderer';
import TopicRoadmap from '../../components/student/pages/theory/TopicRoadmap';
import TheorySearch from '../../components/student/pages/theory/TheorySearch';

const Theory = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [subjects, setSubjects]             = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics]                 = useState([]);
  const [topicsLoading, setTopicsLoading]   = useState(false);
  const [selectedTopic, setSelectedTopic]   = useState(null);
  const [topicContent, setTopicContent]     = useState(null);
  const [loading, setLoading]               = useState(true);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [completedTopics, setCompletedTopics] = useState({});
  const [searchQueryToHighlight, setSearchQueryToHighlight] = useState(null);
  const contentRef = useRef(null);
  const { isDark } = useTheme();

  // ── Effect 1: Fetch subjects + progress ────────────────────────────────────
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/api/subjects`, config);
        setSubjects(res.data.success && res.data.data?.length > 0 ? res.data.data : []);
      } catch { setSubjects([]); }
      finally { setLoading(false); }
    };

    const fetchCompletedTopics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setCompletedTopics(res.data.data);
      } catch (err) {
        if (err.response?.status !== 401) console.error('Error fetching completed topics:', err);
      }
    };

    fetchSubjects();
    fetchCompletedTopics();
  }, []);

  // ── Effect 2: Sync URL → selected subject ─────────────────────────────────
  useEffect(() => {
    if (subjectId && subjects.length > 0 && !selectedSubject) {
      const found = subjects.find(s => s._id === subjectId);
      if (found) setSelectedSubject(found);
      else navigate('/theory', { replace: true });
    }
    if (!subjectId && selectedSubject) {
      setSelectedSubject(null);
      setTopics([]);
      setSelectedTopic(null);
      setTopicContent(null);
    }
  }, [subjectId, subjects]);

  // ── Effect 3: Fetch topics on subject select ───────────────────────────────
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/api/subjects/${selectedSubject._id}/topics`, config);
        if (res.data.success && res.data.data?.length > 0) {
          setTopics(res.data.data);
          // ✅ Do NOT auto-select — show roadmap first
        } else {
          setTopics([]);
        }
      } catch {
        setTopics([]);
      } finally {
        setTopicsLoading(false);
      }
    };
    setSelectedTopic(null);   // reset topic when subject changes
    setTopicContent(null);
    fetchTopics();
  }, [selectedSubject]);

  // ── Effect 4: Fetch full content on topic select ──────────────────────────
  useEffect(() => {
    if (!selectedTopic) return;
    const fetchTopicData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/api/topics/${selectedTopic._id}/full`, config);
        if (res.data.success && res.data.data) {
          setTopicContent(res.data.data);
          if (token && selectedTopic) markTopicAsComplete(selectedTopic._id);
        } else {
          setTopicContent(null);
        }
      } catch { setTopicContent(null); }
    };
    setTopicContent(null);
    fetchTopicData();
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTopic]);

  // ── Effect 5: Scroll to matched search query ─────────────────────────────
  useEffect(() => {
    if (topicContent && searchQueryToHighlight && contentRef.current) {
      setTimeout(() => {
        // Native browser find highlight + scroll
        const found = window.find(searchQueryToHighlight, false, false, true, false, false, false);
        if (!found) {
          console.warn('Could not find text visually:', searchQueryToHighlight);
        }
        setSearchQueryToHighlight(null);
      }, 400); // give time for the content block renderer to mount
    }
  }, [topicContent, searchQueryToHighlight]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isTopicCompleted = (topicId) => {
    if (!selectedSubject || !topicId) return false;
    return completedTopics[selectedSubject._id]?.[topicId] === true;
  };

  const markTopicAsComplete = async (topicId) => {
    if (!selectedSubject || !topicId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post(
        `${API_URL}/api/progress/mark-complete`,
        { subjectId: selectedSubject._id, topicId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompletedTopics(prev => ({
        ...prev,
        [selectedSubject._id]: { ...(prev[selectedSubject._id] || {}), [topicId]: true },
      }));
    } catch { /* Silently fail */ }
  };

  const handleNextTopic = async () => {
    if (!selectedTopic || !selectedSubject) return;
    const updated = {
      ...completedTopics,
      [selectedSubject._id]: {
        ...(completedTopics[selectedSubject._id] || {}),
        [selectedTopic._id]: true,
      },
    };
    setCompletedTopics(updated);
    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please log in to save progress'); return; }
      await axios.post(
        `${API_URL}/api/progress/mark-complete`,
        { subjectId: selectedSubject._id, topicId: selectedTopic._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      setCompletedTopics(completedTopics);
      alert('Failed to save progress. Please try again.');
      return;
    }

    const currentIndex = topics.findIndex(t => t._id === selectedTopic._id);
    if (currentIndex < topics.length - 1) {
      setSelectedTopic(topics[currentIndex + 1]);
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All done — go back to roadmap
      setSelectedTopic(null);
    }
  };

  const handleSearchResult = async (result) => {
    // result = { type, subjectId, topicId, matchWord }
    
    // 1. Ensure subject is found
    const subj = subjects.find(s => s._id === result.subjectId);
    if (!subj) return;
    
    // Keep URL in sync smoothly when deep linking
    navigate(`/theory/${subj._id}`, { replace: true });
    setSelectedSubject(subj);
    
    // 2. Fetch topics for this subject to set the selected topic correctly
    if (result.topicId) {
      setTopicsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/subjects/${result.subjectId}/topics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.data) {
          setTopics(res.data.data);
          const t = res.data.data.find(x => x._id === result.topicId);
          if (t) {
            setSelectedTopic(t);
            if (result.matchWord) {
              setSearchQueryToHighlight(result.matchWord);
            }
          }
        }
      } catch (err) {
        console.error('Failed auto-route to search topic', err);
      } finally {
        setTopicsLoading(false);
      }
    }
  };

  // ── View 1: Subject Selection ──────────────────────────────────────────────
  if (!selectedSubject) {
    return (
      <div
        className="min-h-full relative overflow-auto"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 20% 0%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.08) 0%, transparent 50%)'
            : '#f0f4f8',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isDark ? 0.03 : 0.08,
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(99,179,237,0.8)' : 'rgba(99,179,237,0.5)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(99,179,237,0.8)' : 'rgba(99,179,237,0.5)'} 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
          <TheorySearch onSelectResult={handleSearchResult} />
          <SubjectSelectionGrid
            subjects={subjects}
            completedTopics={completedTopics}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // ── View 2: Topic Roadmap ──────────────────────────────────────────────────
  if (!selectedTopic) {
    return (
      <TopicRoadmap
        subject={selectedSubject}
        topics={topics}
        completedTopics={completedTopics[selectedSubject._id] || {}}
        onSelectTopic={(t) => setSelectedTopic(t)}
        onBack={() => {
          setSelectedSubject(null);
          setTopics([]);
          setSelectedTopic(null);
          navigate('/theory');
        }}
        loading={topicsLoading}
      />
    );
  }

  // ── View 3: Topic Content ──────────────────────────────────────────────────
  const currentIndex = topics.findIndex(t => t._id === selectedTopic._id);
  const subjectCompleted = completedTopics[selectedSubject._id] || {};

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #05080f 0%, #090d1a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>

      {/* ── Gamified Content Header ── */}
      <div
        className="flex-shrink-0 px-3 py-2.5 flex items-center gap-3 border-b"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          background: isDark ? 'rgba(5,8,20,0.9)' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Back → Roadmap */}
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-all"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
            e.currentTarget.style.color = isDark ? 'white' : 'black';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
            e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Mission Map</span>
        </button>

        <div className="h-5 w-px" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }} />

        {/* Topic progress dots */}
        <div className="hidden md:flex items-center gap-1.5">
          {topics.map((t, i) => {
            const isThis = t._id === selectedTopic._id;
            const isDone = subjectCompleted[t._id];
            return (
              <button
                key={t._id}
                onClick={() => setSelectedTopic(t)}
                title={t.name}
                className="transition-all duration-200 rounded-full"
                style={{
                  width: isThis ? '28px' : '10px',
                  height: '10px',
                  background: isDone
                    ? '#10b981'
                    : isThis
                    ? '#3b82f6'
                    : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                  boxShadow: isThis
                    ? '0 0 10px rgba(59,130,246,0.7)'
                    : isDone
                    ? '0 0 8px rgba(16,185,129,0.5)'
                    : 'none',
                }}
              />
            );
          })}
        </div>

        {/* Center: subject > topic */}
        <div className="flex-1 min-w-0 text-center">
          <div className="text-xs mb-0.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{selectedSubject.name}</div>
          <h2
            className="text-sm font-bold truncate"
            style={{ 
              color: isDark ? '#e2e8f0' : '#0f172a',
              textShadow: isDark ? '0 0 16px rgba(59,130,246,0.4)' : 'none' 
            }}
          >
            {selectedTopic?.name}
          </h2>
        </div>

        {/* Checkpoint counter */}
        <div
          className="hidden sm:flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}
        >
          <Zap className="h-3.5 w-3.5 text-blue-400" style={{ filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.8))' }} />
          <span className="text-blue-400 font-bold text-sm">{currentIndex + 1}/{topics.length}</span>
        </div>

        {/* Prev / Next navigation */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => currentIndex > 0 && setSelectedTopic(topics[currentIndex - 1])}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: currentIndex === 0 ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if(currentIndex === 0) return;
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
              e.currentTarget.style.color = isDark ? 'white' : 'black';
            }}
            onMouseLeave={e => {
              if(currentIndex === 0) return;
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
              e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => currentIndex < topics.length - 1 && setSelectedTopic(topics[currentIndex + 1])}
            disabled={currentIndex === topics.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: currentIndex === topics.length - 1 ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
              cursor: currentIndex === topics.length - 1 ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if(currentIndex === topics.length - 1) return;
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
              e.currentTarget.style.color = isDark ? 'white' : 'black';
            }}
            onMouseLeave={e => {
              if(currentIndex === topics.length - 1) return;
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
              e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
            }}
          >
            <span>Next Topic</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu */}
        <button
          className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, 
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' 
          }}
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* ── Content + AskAI ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Content area */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-5 py-8 lg:px-12">
          <div className="max-w-4xl mx-auto">

            {/* Topic title */}
            <h1
              className="text-3xl font-black mb-6 pb-3 border-b"
              style={{
                color: isDark ? 'white' : '#0f172a',
                borderColor: 'rgba(59,130,246,0.2)',
                textShadow: isDark ? '0 0 30px rgba(59,130,246,0.3)' : '0 2px 10px rgba(59,130,246,0.1)',
              }}
            >
              {selectedTopic?.name}
            </h1>

            {/* Content blocks */}
            <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''}`}>
              {topicContent ? (
                <>
                  <ContentBlockRenderer contentBlocks={topicContent.content} />

                  {/* ── Gamified footer ── */}
                  <div
                    className="not-prose mt-12 mb-8 p-5 rounded-2xl flex items-center justify-between border"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))',
                      borderColor: 'rgba(59,130,246,0.2)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isTopicCompleted(selectedTopic._id) ? (
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <CheckCircle className="h-5 w-5" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' }} />
                          <span>Topic Complete!</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Mark this topic as complete to track your progress</span>
                      )}
                    </div>
                    <button
                      onClick={handleNextTopic}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.6)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)'; }}
                    >
                      {currentIndex < topics.length - 1 ? (
                        <>Next Topic <ArrowRight className="h-4 w-4" /></>
                      ) : (
                        <>🏆 Finish Subject</>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div
                    className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
                    style={{ boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}
                  />
                  <p className="text-gray-500 text-sm">Loading topic content...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AskAI Sidebar */}
        <AskAISidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          subjectName={selectedSubject.name}
          topicName={selectedTopic?.name}
        />
      </div>
    </div>
  );
};

export default Theory;
