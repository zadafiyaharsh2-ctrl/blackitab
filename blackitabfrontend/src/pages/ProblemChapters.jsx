import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import API_URL from '../config';

const ProblemChapters = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('Chapters');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // Fetch chapters
        const res = await axios.get(`${API_URL}/api/problems/subjects/${subjectId}/chapters`);
        if (res.data.success) {
          setChapters(res.data.data);
        }
        
        // Also fetch subject details to show name in header (optional, if you have an endpoint for single subject)
        // For now, we'll just show "Chapters" or maybe pass state from previous page
      } catch (err) {
        console.error('Error fetching chapters:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchChapters();
    }
  }, [subjectId]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button 
        onClick={() => navigate('/problems')}
        className="flex items-center text-gray-400 hover:text-purple-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Subjects
      </button>

      <h1 className="text-4xl font-bold text-white mb-8">Select a Chapter</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      ) : (
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
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-5 w-5 text-purple-400 mr-2" />
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {chapter.name}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {chapter.description}
                    </p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-purple-400 transition-colors mt-1" />
                </div>
              </div>
            ))
          ) : (
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
