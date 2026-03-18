/**
 * ============================================================================
 * PROBLEM DETAIL PAGE (ProblemDetail.jsx)
 * ============================================================================
 * 
 * This is the individual problem view.
 * Ideally, this would be an IDE workspace. For now, it's a "Read & Solve" page.
 * 
 * Features:
 * 1. Displays full problem description and constraints.
 * 2. Visual indicators for Difficulty.
 * 3. Action Button to "Mark as Completed" (Manual progress tracking for now).
 *    - In future, this would trigger on passing test cases.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import API_URL from '../../config';
import PageShimmer from '../../components/shared/PageShimmer';

const ProblemDetail = () => {
  // Get problemId from the URL
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * FETCH DATA
   * Get single problem details by ID.
   */
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/problems/${problemId}`);
        if (res.data.success) {
          setProblem(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching problem:', err);
      } finally {
        setLoading(false);
      }
    };

    if (problemId) {
      fetchProblem();
    }
  }, [problemId]);

  // Loading State
  if (loading) return <PageShimmer variant="detail" />;

  // Not Found State
  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Problem not found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 text-purple-400 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back Button (History Navigation) */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      {/* Main Problem Container */}
      <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
        
        {/* Header: Title and Difficulty */}
        <div className="p-8 border-b border-gray-300 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{problem.title}</h1>
              {/* Difficulty Badge with dynamic colors */}
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 
                  problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                  'bg-red-500/10 text-red-400'}`}>
                {problem.difficulty}
              </span>
            </div>
            {/* Future extension: IDE button, share button, etc. */}
          </div>
        </div>
        
        {/* Content Body */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
            {problem.description}
          </p>
          
          {/* Practice Notice */}
          <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <p className="text-blue-300 text-sm">
              This is a practice problem. Try to solve it on paper or in your local IDE first!
            </p>
          </div>

          {/* Action Footer: Mark as Completed */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('Please login to track progress');
                    return;
                  }
                  // API Call to update status
                  await axios.post(`${API_URL}/api/problems/${problemId}/status`, 
                    { status: 'completed' },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  alert('Problem marked as completed!');
                  navigate(-1); // Go back to list after completing
                } catch (err) {
                  console.error('Error updating status:', err);
                  alert('Failed to update status');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-gray-900 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark as Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
