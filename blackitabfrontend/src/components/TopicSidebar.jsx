/**
 * ============================================================================
 * TOPIC SIDEBAR COMPONENT
 * ============================================================================
 * 
 * This component displays a sidebar with a list of topics for the selected subject.
 * It supports both desktop and mobile views with different behaviors:
 * 
 * DESKTOP (lg screens and above):
 * - Sidebar is fixed on the right side
 * - Can be collapsed/expanded using a floating toggle button
 * - Width: 320px (w-80) when open, 0px when collapsed
 * 
 * MOBILE (below lg breakpoint):
 * - Sidebar slides in from the right as an overlay
 * - Has a dark backdrop overlay when open
 * - Can be closed by clicking backdrop or X button
 * - Automatically closes after selecting a topic
 * 
 * Props:
 * - topics: Array of topic objects [{_id, name, subjectId}]
 * - selectedTopic: Currently selected topic object (for highlighting)
 * - onSelectTopic: Callback function when user clicks a topic
 * - isOpen: Boolean controlling sidebar visibility
 * - onToggle: Callback to toggle sidebar open/close
 * - subjectName: Name of current subject (displayed in header)
 * - onBackToSubjects: Callback to return to subject selection page
 */

// Import React library
import React from 'react';

// Import icons from lucide-react for UI elements
import { ChevronLeft, ChevronRight, X, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Define functional component with destructured props
const TopicSidebar = ({ 
  topics,            // Array of all topics for the selected subject
  selectedTopic,     // Currently selected topic (used for highlighting)
  onSelectTopic,     // Function to call when user selects a topic
  isOpen,            // Boolean - whether sidebar is open or closed
  onToggle,          // Function to toggle sidebar open/closed
  subjectName,       // Name of the current subject (e.g., "DBMS")
  onBackToSubjects,  // Function to navigate back to subject selection
  completedTopics    // Object mapping topicId to completion status
}) => {
  const { isDark } = useTheme();
  return (
    <>
      {/* ========================================
          MOBILE BACKDROP OVERLAY
          ========================================
          Dark semi-transparent overlay that appears behind sidebar on mobile
          Only visible on mobile (lg:hidden)
          Clicking it closes the sidebar */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          // When open: fully visible (opacity-100)
          // When closed: invisible and non-interactive (opacity-0 pointer-events-none)
        }`}
        onClick={onToggle} // Click overlay to close sidebar
      />

      {/* ========================================
          SIDEBAR CONTAINER
          ========================================
          Main sidebar element with different behavior on mobile vs desktop */}
      <div 
        className={`
          fixed lg:static inset-y-0 right-0 z-30 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l 
          transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-80' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-l-0'}
          lg:h-full mt-16 lg:mt-0
        `}
        // Breakdown of classes:
        // - fixed lg:static: Fixed position on mobile, static on desktop
        // - inset-y-0 right-0: Positioned at right edge, full height
        // - z-30: High z-index to appear above content
        // - bg-white border-l: White background with left border
        // - transform transition-all: Enable smooth animations
        // - flex flex-col: Vertical flex layout for header and content
        // - When open: translate-x-0 w-80 (visible, 320px wide)
        // - When closed on mobile: translate-x-full (slide off-screen to right)
        // - When closed on desktop: lg:translate-x-0 lg:w-0 (stays in place but width 0)
        // - mt-16 lg:mt-0: Top margin on mobile to account for navbar
      >
        {/* ========================================
            SIDEBAR HEADER
            ========================================
            Contains subject name and navigation buttons */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'} flex items-center justify-between ${!isOpen && 'hidden'}`}>
          {/* Hidden when sidebar is closed */}
          
          {/* Left side: Back button and subject name */}
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Back to subjects button */}
            <button 
              onClick={onBackToSubjects} // Navigate back to subject selection
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title="Back to Subjects" // Tooltip text
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            {/* Subject name heading */}
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'} truncate`}>
              {/* truncate prevents long names from breaking layout */}
              {subjectName}
            </h2>
          </div>
          
          {/* Right side: Close button (mobile only) */}
          <button 
            onClick={onToggle} // Close sidebar
            className="lg:hidden p-2" // Only visible on mobile
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* ========================================
            TOPICS LIST
            ========================================
            Scrollable list of all topics */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar ${!isOpen && 'hidden'}`}>
          {/* flex-1: Takes remaining vertical space */}
          {/* overflow-y-auto: Enables scrolling if content exceeds height */}
          {/* space-y-1: Adds small gap between topic buttons */}
          {/* custom-scrollbar: Custom scrollbar styling (defined in CSS) */}
          {/* Hidden when sidebar is closed */}
          
          {/* Map over topics array and render each as a button */}
          {topics.map((topic) => {
            const isCompleted = completedTopics?.[topic._id] === true;
            return (
              <button
                key={topic._id} // Unique key for React list rendering
                onClick={() => onSelectTopic(topic)} // Call parent function with selected topic
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group
                  ${selectedTopic?._id === topic._id 
                    // If this topic is currently selected:
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm' 
                    // Selected: Blue background, blue text, left border accent, shadow
                    : isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    // Not selected: Gray text, hover effects
                  }`}
              >
                {/* Topic name (truncated if too long) */}
                <span className="truncate pr-2">{topic.name}</span>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Show checkmark if topic is completed */}
                  {isCompleted && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  
                  {/* Chevron icon - only shown for selected topic */}
                  {selectedTopic?._id === topic._id && <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================
          DESKTOP TOGGLE BUTTON
          ========================================
          Floating button on desktop to collapse/expand sidebar
          Hidden on mobile (hidden lg:flex) */}
      <button
        onClick={onToggle} // Toggle sidebar open/closed
        className={`
          hidden lg:flex absolute top-1/2 transform -translate-y-1/2 z-40
          ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'} shadow-md rounded-l-lg p-1.5
          hover:text-blue-600 hover:bg-gray-50 transition-all duration-300
          ${isOpen ? 'right-80' : 'right-0'}
        `}
        // Breakdown of classes:
        // - hidden lg:flex: Hidden on mobile, flex on desktop
        // - absolute top-1/2 -translate-y-1/2: Vertically centered
        // - z-40: Above sidebar (z-30)
        // - bg-white border shadow-md: White button with border and shadow
        // - rounded-l-lg: Rounded left corners (right side is straight against sidebar)
        // - When sidebar open: right-80 (positioned at left edge of sidebar)
        // - When sidebar closed: right-0 (positioned at right edge of screen)
        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"} // Tooltip text
      >
        {/* Show different icon based on sidebar state */}
        {isOpen 
          ? <ChevronRight className="h-5 w-5" /> // Right arrow when open (to collapse)
          : <ChevronLeft className="h-5 w-5" />  // Left arrow when closed (to expand)
        }
      </button>
    </>
  );
};

// Export component as default export
export default TopicSidebar;
