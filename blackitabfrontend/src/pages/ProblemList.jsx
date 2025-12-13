import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, Circle, Clock, ChevronRight } from 'lucide-react';
import API_URL from '../config';

const ProblemList = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        };
        const res = await axios.get(`${API_URL}/api/problems/chapters/${chapterId}/problems`, config);
        if (res.data.success) {
          setProblems(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchProblems();
    }
  }, [chapterId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate(`/problems/${subjectId}`)}
        className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Chapters
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">Problems</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-sm border border-gray-700 overflow-hidden">
          {problems.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  onClick={() => navigate(`/problems/view/${problem._id}`)}
                  className="p-6 hover:bg-gray-700/50 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0" title={problem.status.replace('_', ' ')}>
                      {getStatusIcon(problem.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {problem.title}
                      </h3>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No problems found for this chapter yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProblemList;
