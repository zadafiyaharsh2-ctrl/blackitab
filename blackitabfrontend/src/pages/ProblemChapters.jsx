/**
 * ============================================================================
 * PROBLEM CHAPTERS PAGE (ProblemChapters.jsx)
 * ============================================================================
 * 
 * This page displays the list of chapters (sub-categories) for a selected subject.
 * Example: If user selects "DSA" (Subject), this page shows "Arrays", "Linked Lists", etc. (Chapters).
 * 
 * Flow:
 * 1. User arrives here with a `subjectId` in the URL.
 * 2. Component fetches chapters for this subject from the backend.
 * 3. Renders a grid of cards, each representing a chapter.
 * 4. Clicking a chapter navigates to the list of problems for that chapter.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import API_URL from '../config'; // Centralized API URL

const ProblemChapters = () => {
  // Extract subjectId from URL parameters (e.g. /problems/:subjectId)
  const { subjectId } = useParams();
  
  // Navigation hook
  const navigate = useNavigate();
  
  // State for storing chapters data
  const [chapters, setChapters] = useState([]);
  
  // Loading state for UI feedback
  const [loading, setLoading] = useState(true);

  /**
   * FETCH DATA ON MOUNT
   * Triggered when component mounts or subjectId changes.
   */
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        // API Call: Get chapters for specific subject
        const res = await axios.get(`${API_URL}/api/problems/subjects/${subjectId}/chapters`);
        
        if (res.data.success) {
          setChapters(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        // Could add error state here to show user feedback
      } finally {
        // Stop loading spinner regardless of success/failure
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchChapters();
    }
  }, [subjectId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Back Button Navigation */}
      <button 
        onClick={() => navigate('/problems')}
        className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Subjects
      </button>

      {/* Page Title */}
      <h1 className="text-4xl font-bold text-white mb-8">Select a Chapter</h1>

      {/* Main Content Area */}
      {loading ? (
        // Loading Spinner
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      ) : (
        // Grid of Chapter Cards
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <div
                key={chapter._id}
                onClick={() => navigate(`/problems/${subjectId}/chapters/${chapter._id}`)}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg cursor-pointer p-6 border border-gray-700 transition-all hover:border-purple-500/30 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Chapter Header */}
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-purple-400 mr-2" />
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {chapter.name}
                      </h3>
                    </div>
                    {/* Chapter Description */}
                    <p className="text-gray-400 text-sm mt-1">
                      {chapter.description}
                    </p>
                  </div>
                  {/* Decorational elements */}
                  <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-purple-400 transition-colors mt-1" />
                </div>
              </div>
            ))
          ) : (
            // Empty State
            <div className="col-span-full text-center py-12 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
              <p className="text-gray-400 text-lg">No chapters found for this subject.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemChapters;
