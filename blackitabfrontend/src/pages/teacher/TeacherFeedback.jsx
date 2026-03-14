import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCommentDots, FaClock, FaStar, FaUserGraduate, FaSpinner } from 'react-icons/fa';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const TeacherFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/feedback/teacher`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto mt-16 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
          <FaCommentDots className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Feedback</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            See what your students think about your classes
          </p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <FaCommentDots className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Feedback Yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You haven't received any feedback from students yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {fb.studentId?.profileImage ? (
                    <img src={fb.studentId.profileImage} alt="Student" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <FaUserGraduate />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {fb.studentId?.name || 'Unknown Student'}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <FaClock className="text-[10px]" />
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar 
                      key={star} 
                      className={`text-sm ${star <= fb.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
              </div>

              {fb.batchId && (
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg border border-blue-100 dark:border-blue-500/20">
                    {fb.batchId.name} {fb.batchId.classCode ? `(${fb.batchId.classCode})` : ''}
                  </span>
                </div>
              )}

              <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {fb.comment ? `"${fb.comment}"` : <span className="text-gray-400 not-italic">No comment provided</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherFeedback;
