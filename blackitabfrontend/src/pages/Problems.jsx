import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Code, ChevronRight } from 'lucide-react';
import API_URL from '../config';

const Problems = () => {
  const [problemSubjects, setProblemSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblemSubjects = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/problems/subjects`);
        if (res.data.success) {
          setProblemSubjects(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching problem subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblemSubjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Problem Sets</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-b-2 border-purple-600 rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {problemSubjects.map((subject) => (
            <div
              key={subject._id}
              onClick={() => navigate(`/problems/${subject._id}`)}
              className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl cursor-pointer p-6 border border-gray-700 group transition hover:border-purple-500/30"
            >
              <div className="h-14 w-14 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition">
                <Code className="text-purple-400 group-hover:text-white h-8 w-8" />
              </div>

              <h2 className="text-xl font-bold text-white">{subject.name}</h2>
              
              <p className="text-gray-400 mt-2 line-clamp-2">
                {subject.description}
              </p>

              <div className="flex items-center text-purple-400 mt-5 font-semibold group-hover:text-purple-300">
                Start Solving <ChevronRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Problems;
