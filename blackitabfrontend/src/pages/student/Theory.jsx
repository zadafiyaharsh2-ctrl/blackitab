/**
 * THEORY PAGE COMPONENT
 * 
 * Main Theory page displaying subjects and their topics.
 * Views: 1) Subject selection grid, 2) Topic content with sidebar
 * 
 * Data Flow:
 * - Fetches subjects on mount → topics on subject select → content on topic select
 * - Renders content dynamically via ContentBlockRenderer component
 */

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, CheckCircle, ArrowRight } from "lucide-react";
import TopicDropdown from "../../components/student/TopicDropdown";
import AskAISidebar from "../../components/shared/AskAISidebar";
import API_URL from "../../config";
import SubjectSelectionGrid from "../../components/student/pages/theory/SubjectSelectionGrid";
import ContentBlockRenderer from "../../components/student/pages/theory/ContentBlockRenderer";

const Theory = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  // State
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicContent, setTopicContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedTopics, setCompletedTopics] = useState({});
  const contentRef = useRef(null);

  // ── Effect 1: Fetch subjects + completed progress on mount ──
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/api/subjects`, config);
        if (res.data.success && res.data.data?.length > 0) {
          setSubjects(res.data.data);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCompletedTopics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/progress`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.data.success) setCompletedTopics(res.data.data);
      } catch (err) {
        if (err.response?.status !== 401) console.error('Error fetching completed topics:', err);
      }
    };

    fetchSubjects();
    fetchCompletedTopics();
  }, []);

  // ── Effect 2: Sync URL param with selected subject ──
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

  // ── Effect 3: Fetch topics when subject selected ──
  useEffect(() => {
    if (!selectedSubject) return;
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/api/subjects/${selectedSubject._id}/topics`, config);
        if (res.data.success && res.data.data?.length > 0) {
          setTopics(res.data.data);
          setSelectedTopic(res.data.data[0]);
        } else {
          setTopics([]);
          setSelectedTopic(null);
        }
      } catch (err) {
        setTopics([]);
        setSelectedTopic(null);
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  // ── Effect 4: Fetch topic content when topic selected ──
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
      } catch (err) {
        setTopicContent(null);
      }
    };
    fetchTopicData();
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedTopic]);

  // ── Helpers ──
  const isTopicCompleted = (topicId) => {
    if (!selectedSubject || !topicId) return false;
    return completedTopics[selectedSubject._id]?.[topicId] === true;
  };

  const markTopicAsComplete = async (topicId) => {
    if (!selectedSubject || !topicId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.post(`${API_URL}/api/progress/mark-complete`,
        { subjectId: selectedSubject._id, topicId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCompletedTopics(prev => ({
        ...prev,
        [selectedSubject._id]: { ...(prev[selectedSubject._id] || {}), [topicId]: true }
      }));
    } catch { /* Silently fail - non-critical */ }
  };

  const handleNextTopic = async () => {
    if (!selectedTopic || !selectedSubject) return;
    const updated = {
      ...completedTopics,
      [selectedSubject._id]: {
        ...(completedTopics[selectedSubject._id] || {}),
        [selectedTopic._id]: true
      }
    };
    setCompletedTopics(updated);

    try {
      const token = localStorage.getItem('token');
      if (!token) { alert('Please log in to save your progress'); return; }
      await axios.post(`${API_URL}/api/progress/mark-complete`,
        { subjectId: selectedSubject._id, topicId: selectedTopic._id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving progress:', error);
      setCompletedTopics(completedTopics);
      alert('Failed to save progress. Please try again.');
      return;
    }

    const currentIndex = topics.findIndex(t => t._id === selectedTopic._id);
    if (currentIndex < topics.length - 1) {
      setSelectedTopic(topics[currentIndex + 1]);
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('🎉 Congratulations! You\'ve completed all topics in this subject!');
    }
  };

  // ── View 1: Subject Selection ──
  if (!selectedSubject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Theory Subjects</h1>
        <SubjectSelectionGrid subjects={subjects} completedTopics={completedTopics} loading={loading} />
      </div>
    );
  }

  // ── View 2: Topic Content Page ──
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-transparent overflow-hidden">
      {/* Topic Dropdown Bar */}
      <div className="px-4 lg:px-8 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <TopicDropdown
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={(t) => setSelectedTopic(t)}
          subjectName={selectedSubject.name}
          onBackToSubjects={() => navigate('/theory')}
          completedTopics={completedTopics[selectedSubject._id] || {}}
        />
      </div>

      {/* Content + AskAI */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content Area */}
        <div ref={contentRef} className="flex-1 p-6 lg:p-12 overflow-y-auto">
          <div className="lg:hidden flex justify-between items-center mb-4">
            <span className="font-bold text-gray-900 dark:text-white">{selectedTopic?.name}</span>
            <button onClick={() => setSidebarOpen(true)} title="Open AI Assistant">
              <Menu className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
              {selectedTopic?.name}
            </h1>

            <div className="prose prose-lg">
              {topicContent ? (
                <>
                  <ContentBlockRenderer contentBlocks={topicContent.content} />

                  {/* Next Topic Button */}
                  <div className="not-prose mt-12 mb-8 flex items-center justify-between border-t pt-8">
                    <div className="flex items-center text-sm text-gray-600">
                      {isTopicCompleted(selectedTopic._id) ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Topic Completed!</span>
                        </div>
                      ) : (
                        <span>Mark this topic as complete and continue</span>
                      )}
                    </div>
                    <button
                      onClick={handleNextTopic}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-gray-900 dark:text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <span>Next Topic</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
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
