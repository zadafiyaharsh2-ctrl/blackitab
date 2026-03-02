/**
 * ============================================================================
 * THEORY PAGE COMPONENT
 * ============================================================================
 * 
 * This is the main Theory page that displays subjects and their topics.
 * It handles three main views:
 * 1. Subject selection page (shows all available subjects like DBMS, OS, etc.)
 * 2. Topic list with content view (shows topics in sidebar and content in main area)
 * 3. Mobile-responsive layout with collapsible sidebar
 * 
 * Data Flow:
 * - Fetches subjects from API on component mount
 * - When user selects a subject, fetches all topics for that subject
 * - When user selects a topic, fetches full content from full_data_of_topics collection
 * - Renders content dynamically based on content block types (paragraph, heading, list, image, etc.)
 */

// Import React hooks for state management and side effects
import React, { useState, useEffect, useRef } from "react";

// Import axios for making HTTP requests to the backend API
import axios from "axios";

// Import icons from lucide-react library for UI elements
import { BookOpen, ChevronRight, Menu, CheckCircle, ArrowRight } from "lucide-react";

// Import the TopicDropdown component for topic navigation at the top
import TopicDropdown from "../components/TopicDropdown";
// Import the AskAI sidebar component for the right panel
import AskAISidebar from "../components/AskAISidebar";
import API_URL from "../config";
import { mockSubjects, getMockTopics, getMockTopicContent } from "../data/mockTheoryData";

const Theory = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Array of all subjects (e.g., DBMS, Operating Systems, etc.)
  // Initially empty, populated when component mounts
  const [subjects, setSubjects] = useState([]);

  // Currently selected subject object (contains _id, name, description)
  // null means no subject selected, shows subject selection page
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Array of topics for the selected subject
  // Each topic has _id, name, subjectId
  const [topics, setTopics] = useState([]);

  // Currently selected topic object
  // When this changes, full content is fetched from API
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Full content data for the selected topic
  // Contains title, content array with blocks (paragraphs, headings, lists, images)
  const [topicContent, setTopicContent] = useState(null);

  // Loading state for initial subjects fetch
  // Shows spinner while subjects are being loaded
  const [loading, setLoading] = useState(true);

  // Controls whether the topic sidebar is open or closed
  // Used for mobile responsiveness - sidebar can be toggled
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Track completed topics using localStorage
  // Format: { subjectId: { topicId: true, topicId2: true } }
  const [completedTopics, setCompletedTopics] = useState({});

  // Ref for the content container to handle scrolling
  const contentRef = useRef(null);

  // ============================================================================
  // EFFECT 1: FETCH SUBJECTS ON COMPONENT MOUNT
  // ============================================================================
  // This runs once when the component first renders (empty dependency array [])
  // Fetches all available subjects from the backend API
  useEffect(() => {
    // Define async function to fetch subjects
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/subjects`);

        // If we get an empty array or the request succeeds but has no data, use mock data
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          setSubjects(res.data.data);
        } else {
          console.log("Empty subjects array from backend, applying intelligent fallback data.");
          setSubjects(mockSubjects);
        }
      } catch (err) {
        console.error("Error fetching subjects, falling back to mock data:", err);
        setSubjects(mockSubjects);
      } finally {
        // Always set loading to false, whether request succeeds or fails
        // This hides the loading spinner
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchSubjects();

    // Load completed topics from backend API
    const fetchCompletedTopics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // User not logged in - that's okay, progress won't be saved
          return;
        }

        const res = await axios.get(`${API_URL}/api/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.data.success) {
          setCompletedTopics(res.data.data);
        }
      } catch (err) {
        // Silently fail if unauthorized - user might not be logged in
        // or token might be invalid, which is acceptable
        if (err.response?.status === 401) {
          console.log('Not authenticated - progress will not be loaded');
        } else {
          console.error('Error fetching completed topics:', err);
        }
      }
    };

    fetchCompletedTopics();
  }, []); // Empty dependency array means this runs only once on mount

  // ============================================================================
  // EFFECT 2: FETCH TOPICS WHEN SUBJECT IS SELECTED
  // ============================================================================
  // This runs whenever selectedSubject changes
  // Fetches all topics for the selected subject
  useEffect(() => {
    // If no subject is selected, don't do anything
    // This prevents unnecessary API calls
    if (!selectedSubject) return;

    // Define async function to fetch topics
    const fetchTopics = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/subjects/${selectedSubject._id}/topics`
        );

        if (res.data.success && res.data.data && res.data.data.length > 0) {
          setTopics(res.data.data);
          setSelectedTopic(res.data.data[0]);
        } else {
          console.log("Empty topics from backend, applying intelligent fallback data.");
          const dummyTopics = getMockTopics(selectedSubject._id);
          setTopics(dummyTopics);
          setSelectedTopic(dummyTopics[0]);
        }
      } catch (err) {
        console.error("Error fetching topics, falling back:", err);
        const dummyTopics = getMockTopics(selectedSubject._id);
        setTopics(dummyTopics);
        setSelectedTopic(dummyTopics[0]);
      }
    };

    // Call the fetch function
    fetchTopics();
  }, [selectedSubject]); // Runs whenever selectedSubject changes

  // ============================================================================
  // EFFECT 3: FETCH FULL TOPIC CONTENT WHEN TOPIC IS SELECTED
  // ============================================================================
  // This runs whenever selectedTopic changes
  // Fetches complete content from full_data_of_topics collection
  useEffect(() => {
    // If no topic is selected, don't do anything
    if (!selectedTopic) return;

    // Define async function to fetch topic content
    const fetchTopicData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/topics/${selectedTopic._id}/full`
        );

        if (res.data.success && res.data.data && res.data.data.content && res.data.data.content.length > 0) {
          setTopicContent(res.data.data);
        } else {
          console.log("Empty content from backend, applying intelligent fallback data.");
          setTopicContent(getMockTopicContent(selectedTopic));
        }
      } catch (err) {
        console.error("Error fetching topic content, falling back:", err);
        setTopicContent(getMockTopicContent(selectedTopic));
      }
    };

    // Call the fetch function
    fetchTopicData();

    // Scroll content to top when topic changes
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedTopic]); // Runs whenever selectedTopic changes

  // ============================================================================
  // CONTENT RENDERING FUNCTION
  // ============================================================================
  // This function takes an array of content blocks and renders them as React components
  // Each block has a 'type' field that determines how it's rendered
  // Supported types: paragraph, heading, list, numbered_list, image
  const renderContent = (contentBlocks) => {
    // If no content blocks provided, return null (render nothing)
    if (!contentBlocks) return null;

    // Map over each content block and render based on type
    return contentBlocks.map((block, index) => {
      // Use switch statement to handle different block types
      switch (block.type) {
        // ========================================
        // PARAGRAPH BLOCK
        // ========================================
        // Renders regular text paragraphs
        // Block structure: { type: "paragraph", text: "..." }
        case "paragraph":
          return (
            <p key={index} className="mb-4 leading-relaxed text-lg text-gray-700 dark:text-gray-300">
              {block.text}
            </p>
          );

        // ========================================
        // HEADING BLOCK
        // ========================================
        // Renders section headings (h2 elements)
        // Block structure: { type: "heading", text: "..." }
        case "heading":
          return (
            <h2 key={index} className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
              {block.text}
            </h2>
          );

        // ========================================
        // UNORDERED LIST BLOCK
        // ========================================
        // Renders bullet point lists
        // Block structure: { type: "list", title: "...", items: [...] }
        // Title is optional
        case "list":
          return (
            <div key={index} className="mb-6">
              {/* Render list title if provided */}
              {block.title && (
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-200">{block.title}</h3>
              )}
              {/* Render unordered list with disc bullets */}
              <ul className="list-disc ml-6 space-y-2 text-lg text-gray-700 dark:text-gray-300">
                {/* Map over items array and render each as list item */}
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );

        // ========================================
        // NUMBERED LIST BLOCK
        // ========================================
        // Renders ordered/numbered lists
        // Block structure: { type: "numbered_list", items: [...] }
        case "numbered_list":
          return (
            <ol key={index} className="list-decimal ml-6 mb-6 space-y-2 text-lg text-gray-700 dark:text-gray-300">
              {/* Map over items array and render each as list item */}
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          );

        // ========================================
        // IMAGE BLOCK
        // ========================================
        // Renders images with optional captions
        // Block structure: { type: "image", src: "...", alt: "...", caption: "...", maxHeight: "..." }
        case "image":
          return (
            <div key={index} className="my-8 flex flex-col items-center">
              {/* Image element with responsive sizing */}
              <img
                src={block.src} // Image path (relative to public folder)
                alt={block.alt || "Topic illustration"} // Alt text for accessibility
                className="max-w-full h-auto rounded-lg shadow-md" // Responsive, rounded, with shadow
                style={{ maxHeight: block.maxHeight || '600px', maxWidth: '800px' }} // Larger default max height 600px
              />
              {/* Render caption if provided */}
              {block.caption && (
                <p className="text-sm text-gray-600 mt-2 italic text-center">
                  {block.caption}
                </p>
              )}
            </div>
          );

        // ========================================
        // CODE BLOCK
        // ========================================
        // Renders code snippets in a styled gray box with syntax highlighting
        // Block structure: { type: "code", text: "...", language: "..." }
        // Language is optional and can be used for syntax highlighting
        case "code":
          return (
            <div key={index} className="my-4">
              <pre className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre">
                  {block.code || block.text}
                </code>
              </pre>
            </div>
          );

        // ========================================
        // TABLE BLOCK
        // ========================================
        // Renders tables with headers, rows, and optional captions
        // Block structure: { type: "table", headers: [...], rows: [[...], [...]], caption: "..." }
        case "table":
          // Check if table is too wide (more than 5 columns)
          const shouldSplit = block.headers && block.headers.length > 5;

          if (shouldSplit) {
            // Split table into two halves
            const midPoint = Math.ceil(block.headers.length / 2);
            const firstHalfHeaders = block.headers.slice(0, midPoint);
            const secondHalfHeaders = block.headers.slice(midPoint);

            return (
              <div key={index} className="my-6">
                {/* First half of table */}
                <div className="overflow-x-auto max-w-full mb-4">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {firstHalfHeaders.map((header, i) => (
                          <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                          {row.slice(0, midPoint).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Second half of table */}
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {secondHalfHeaders.map((header, i) => (
                          <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                          {row.slice(midPoint).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Render caption if provided */}
                {block.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic text-center">
                    {block.caption}
                  </p>
                )}
              </div>
            );
          }

          // Normal table rendering for tables with 5 or fewer columns
          return (
            <div key={index} className="my-6 overflow-x-auto max-w-full">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                {/* Table header */}
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {block.headers.map((header, i) => (
                      <th key={i} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Table body */}
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900/30" : "bg-gray-50 dark:bg-gray-800/30"}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Render caption if provided */}
              {block.caption && (
                <p className="text-sm text-gray-600 mt-2 italic text-center">
                  {block.caption}
                </p>
              )}
            </div>
          );

        // ========================================
        // DEFAULT CASE
        // ========================================
        // If block type is not recognized, render nothing
        default:
          return null;
      }
    });
  };

  // ============================================================================
  // HELPER FUNCTIONS FOR TOPIC COMPLETION
  // ============================================================================

  /**
   * Check if a topic is completed
   * @param {string} topicId - The ID of the topic to check
   * @returns {boolean} - True if topic is completed
   */
  const isTopicCompleted = (topicId) => {
    if (!selectedSubject || !topicId) return false;
    return completedTopics[selectedSubject._id]?.[topicId] === true;
  };

  /**
   * Mark current topic as complete and move to next topic
   * Saves completion status to backend database
   */
  const handleNextTopic = async () => {
    if (!selectedTopic || !selectedSubject) return;

    // Optimistically update UI immediately for better UX
    const updated = {
      ...completedTopics,
      [selectedSubject._id]: {
        ...(completedTopics[selectedSubject._id] || {}),
        [selectedTopic._id]: true
      }
    };
    setCompletedTopics(updated);

    // Save to backend database
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save your progress');
        return;
      }

      await axios.post(
        `${API_URL}/api/progress/mark-complete`,
        {
          subjectId: selectedSubject._id,
          topicId: selectedTopic._id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Topic completion saved to database');
    } catch (error) {
      console.error('Error saving progress:', error);
      // Revert optimistic update on error
      setCompletedTopics(completedTopics);
      alert('Failed to save progress. Please try again.');
      return; // Don't navigate if save failed
    }

    // Find next topic and navigate to it
    const currentIndex = topics.findIndex(t => t._id === selectedTopic._id);
    if (currentIndex < topics.length - 1) {
      // Move to next topic
      const nextTopic = topics[currentIndex + 1];
      setSelectedTopic(nextTopic);

      // Scroll to top smoothly
      // Scroll to top smoothly
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // If this was the last topic, stay on current topic
      alert('🎉 Congratulations! You\'ve completed all topics in this subject!');
    }
  };

  // ============================================================================
  // VIEW 1: SUBJECT SELECTION PAGE
  // ============================================================================
  // ============================================================================
  // This view is shown when no subject is selected (selectedSubject is null)
  // Displays a grid of subject cards that users can click to select
  if (!selectedSubject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page title */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Theory Subjects</h1>

        {/* Show loading spinner or subject grid based on loading state */}
        {loading ? (
          // Loading state: show animated spinner
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
          </div>
        ) : (
          // Loaded state: show subject cards in responsive grid
          // 1 column on mobile, 2 on tablet, 3 on desktop
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Map over subjects array and render each as a card */}
            {subjects.map((subject) => {
              // Calculate progress for this subject
              const completedCount = Object.keys(completedTopics[subject._id] || {}).length;
              const totalTopics = subject.topicCount || 0;
              const progressPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

              return (
                <div
                  key={subject._id} // Unique key for React list rendering
                  onClick={() => setSelectedSubject(subject)} // Set selected subject on click
                  className="bg-white dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl cursor-pointer p-6 border border-gray-300 dark:border-gray-700 group transition hover:border-blue-500/30"
                >
                  {/* Icon container with hover effect */}
                  <div className="h-14 w-14 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition">
                    {/* BookOpen icon that changes color on hover */}
                    <BookOpen className="text-blue-400 group-hover:text-gray-900 dark:text-white h-8 w-8" />
                  </div>

                  {/* Subject name */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{subject.name}</h2>

                  {/* Subject description (limited to 2 lines) */}
                  <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {subject.description}
                  </p>

                  {/* Progress Section */}
                  <div className="mt-4 space-y-2">
                    {/* Progress text and percentage */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {completedCount}/{totalTopics} topics completed
                      </span>
                      <span className="text-blue-400 font-bold">
                        {progressPercentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Call-to-action with arrow icon */}
                  <div className="flex items-center text-blue-400 mt-5 font-semibold group-hover:text-blue-300">
                    {completedCount > 0 ? 'Continue Learning' : 'Start Learning'} <ChevronRight className="ml-2 h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: TOPIC CONTENT PAGE WITH SIDEBAR
  // ============================================================================
  // This view is shown when a subject is selected
  // Layout: Top has topic dropdown, left side shows content, right side has AskAI sidebar
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-transparent overflow-hidden">

      {/* ========================================
          TOP BAR: TOPIC DROPDOWN NAVIGATION
          ======================================== */}
      <div className="px-4 lg:px-8 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
        <TopicDropdown
          topics={topics}
          selectedTopic={selectedTopic}
          onSelectTopic={(t) => {
            setSelectedTopic(t);
          }}
          subjectName={selectedSubject.name}
          onBackToSubjects={() => setSelectedSubject(null)}
          completedTopics={completedTopics[selectedSubject._id] || {}}
        />
      </div>

      {/* ========================================
          MAIN AREA: CONTENT + ASK AI SIDEBAR
          ======================================== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ========================================
            LEFT SIDE: TOPIC CONTENT AREA
            ======================================== */}
        <div ref={contentRef} className="flex-1 p-6 lg:p-12 overflow-y-auto">

          {/* ========================================
              MOBILE HEADER
              ======================================== 
              Only visible on mobile (hidden on lg screens)
              Shows topic name and menu button to open AskAI sidebar */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <span className="font-bold text-gray-900 dark:text-white">{selectedTopic?.name}</span>
            <button onClick={() => setSidebarOpen(true)} title="Open AI Assistant">
              <Menu className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* ========================================
              TOPIC CONTENT CONTAINER
              ======================================== */}
          <div className="max-w-4xl mx-auto">
            {/* Topic title as main heading */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-300 dark:border-gray-700 pb-3">
              {selectedTopic?.name}
            </h1>

            {/* Content area with prose styling for better typography */}
            <div className="prose prose-lg">
              {topicContent ? (
                <>
                  {renderContent(topicContent.content)}

                  {/* Next Button at the end of content */}
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

        {/* ========================================
            RIGHT SIDE: ASK AI SIDEBAR
            ========================================
            AI chat assistant for help with the current topic */}
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

// Export component as default export
export default Theory;
