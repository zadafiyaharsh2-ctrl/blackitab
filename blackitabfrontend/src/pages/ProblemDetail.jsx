import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import API_URL from '../config';

const ProblemDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-white">Problem not found</h2>
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
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg border border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{problem.title}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 
                  problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' : 
                  'bg-red-500/10 text-red-400'}`}>
                {problem.difficulty}
              </span>
            </div>
            {/* Placeholder for action buttons like "Solve" if we had an IDE link */}
          </div>
        </div>
        
        <div className="p-8">
          <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
          <p className="text-gray-300 leading-relaxed text-lg">
            {problem.description}
          </p>
          
          {/* Placeholder for examples or constraints if added to model later */}
          <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
            <p className="text-blue-300 text-sm">
              This is a practice problem. Try to solve it on paper or in your local IDE first!
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('Please login to track progress');
                    return;
                  }
                  await axios.post(`${API_URL}/api/problems/${problemId}/status`, 
                    { status: 'completed' },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  alert('Problem marked as completed!');
                  navigate(-1);
                } catch (err) {
                  console.error('Error updating status:', err);
                  alert('Failed to update status');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center"
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
