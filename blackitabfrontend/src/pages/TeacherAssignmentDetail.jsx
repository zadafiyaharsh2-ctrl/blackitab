import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCheckCircle, FaTimes, FaUserGraduate, FaCalendarAlt, FaStar, FaEdit, FaClipboardList } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_URL from '../config';

const TeacherAssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grading Modal State
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: 0, teacherRemarks: '' });

  useEffect(() => {
    fetchAssignmentDetail();
  }, [id]);

  const fetchAssignmentDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/teacher/assignment/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAssignment(res.data.data.assignment);
        setSubmissions(res.data.data.submissions);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (sub) => {
    setActiveSubmission(sub);
    setGradeData({
      score: sub.score || 0,
      teacherRemarks: sub.teacherRemarks || ''
    });
    setShowGradeModal(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_URL}/api/teacher/assignment/${id}/submissions/${activeSubmission._id}/grade`,
        { score: Number(gradeData.score), teacherRemarks: gradeData.teacherRemarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Grade submitted successfully');
        // Update local state
        setSubmissions(submissions.map(s => 
          s._id === activeSubmission._id 
            ? { ...s, score: gradeData.score, teacherRemarks: gradeData.teacherRemarks, gradedAt: new Date() }
            : s
        ));
        setShowGradeModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit grade');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#05000a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#05000a] text-gray-900 dark:text-white">
        <FaClipboardList className="text-6xl text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold">Assignment Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-yellow-600 dark:text-yellow-400 hover:underline">
          Go back to Assignments
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05000a] text-gray-900 dark:text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-yellow-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-600/10 blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Back navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Grading Dashboard
          </h1>
        </div>

        {/* Assignment Info Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{assignment.title}</h2>
              <p className="text-gray-400 text-sm">{assignment.description || 'No description provided.'}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Due Date</div>
                <div className="font-mono text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-lg">
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Max Marks</div>
                <div className="font-mono text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-lg text-xl">
                  {assignment.totalMarks}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <FaUserGraduate className="text-yellow-500" />
            Student Submissions ({submissions.length})
          </h3>

          {submissions.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 border-dashed rounded-2xl">
              <p className="text-gray-400">No submissions yet for this assignment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-yellow-500/30 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold shadow-inner">
                          {sub.studentId?.name ? sub.studentId.name[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{sub.studentId?.name || 'Unknown Student'}</h4>
                          <p className="text-xs text-gray-400">{sub.studentId?.email || 'No email'}</p>
                        </div>
                      </div>
                      
                      {sub.gradedAt ? (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-green-500/20">
                          <FaCheckCircle /> Graded
                        </div>
                      ) : (
                        <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold border border-yellow-500/20">
                          Pending
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-4 font-mono">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      {sub.gradedAt && (
                        <div className="text-sm">
                          <span className="text-gray-400">Score: </span>
                          <span className="font-black text-lg text-yellow-400">{sub.score} <span className="text-xs text-gray-500 font-normal">/ {assignment.totalMarks}</span></span>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => openGradeModal(sub)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        sub.gradedAt 
                          ? 'bg-white/10 hover:bg-white/20 text-white' 
                          : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                      }`}
                    >
                      <FaEdit /> {sub.gradedAt ? 'Edit Grade' : 'Grade Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GRADING MODAL */}
        {showGradeModal && activeSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              onClick={() => setShowGradeModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <div
              className="relative w-full max-w-md bg-[#0a0510] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Grade Student</h3>
                  <p className="text-sm text-yellow-400">{activeSubmission.studentId?.name}</p>
                </div>
                <button onClick={() => setShowGradeModal(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleGradeSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center justify-between">
                    <span>Marks Awarded</span>
                    <span className="text-gray-500 font-normal">Max: {assignment.totalMarks}</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" required
                      min="0" max={assignment.totalMarks}
                      value={gradeData.score}
                      onChange={(e) => setGradeData({...gradeData, score: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all pl-12"
                    />
                    <FaStar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Teacher Remarks</label>
                  <textarea 
                    rows={4}
                    placeholder="Provide constructive feedback..."
                    value={gradeData.teacherRemarks}
                    onChange={(e) => setGradeData({...gradeData, teacherRemarks: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowGradeModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all">
                    Submit Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
};

export default TeacherAssignmentDetail;
