import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaFileAlt, FaUserGraduate, FaCalendarAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherTestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetail();
  }, [id]);

  const fetchExamDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/teacher/exam/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setExam(res.data.data.exam);
        setResults(res.data.data.results || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load test details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05000a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05000a] text-white">
        <FaFileAlt className="text-6xl text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold">Test Not Found</h2>
        <button onClick={() => navigate('/teacher/tests')} className="mt-4 text-green-400 hover:underline">
          Go back to Tests
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05000a] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-green-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher/tests')}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
            Test Dashboard
          </h1>
        </div>

        {/* Exam Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{exam.title}</h2>
              <p className="text-gray-400 text-sm max-w-2xl">{exam.description || 'No description provided.'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Status</div>
                <div className={`font-bold px-3 py-1 rounded-lg text-sm ${
                  exam.status === 'ongoing' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                  exam.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                  'bg-green-500/20 text-green-400 border border-green-500/20'
                }`}>
                  {exam.status.toUpperCase()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Scheduled</div>
                <div className="font-mono text-gray-300 font-bold bg-white/5 px-3 py-1 rounded-lg flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-500" /> {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Duration</div>
                <div className="font-mono text-gray-300 font-bold bg-white/5 px-3 py-1 rounded-lg flex items-center gap-2">
                  <FaClock className="text-emerald-500" /> {exam.duration}m
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Marks</div>
                <div className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded-lg text-xl">
                  {exam.totalMarks}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaUserGraduate className="text-emerald-500" />
            Student Results ({results.length})
          </h3>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
              <p className="text-gray-400">No results available yet. Students may not have taken this test.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((res) => (
                <div
                  key={res._id || Math.random()}
                  className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Rank indicator (if any) */}
                  {res.rank === 1 && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-bl-lg">Rank #1</div>}

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner ${res.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}>
                        {res.studentId?.name ? res.studentId.name[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{res.studentId?.name || 'Unknown Student'}</h4>
                        <p className="text-xs text-gray-400">{res.studentId?.email || 'No email'}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4 font-mono">
                      Submitted: {res.submittedAt ? new Date(res.submittedAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-400">Score: </span>
                      <span className="font-black text-2xl text-emerald-400">{res.score || 0} <span className="text-xs text-gray-500 font-normal">/ {exam.totalMarks}</span></span>
                    </div>
                    {res.rank && (
                      <div className="text-sm text-gray-400 font-bold bg-white/5 px-3 py-1 rounded">
                        Rank #{res.rank}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherTestDetail;
