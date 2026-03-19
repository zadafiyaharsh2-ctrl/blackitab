import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  FaArrowLeft, FaStar, FaChartLine, FaCheckCircle, FaTrophy,
  FaFire, FaClipboardList, FaFileAlt, FaGraduationCap, FaClock
} from 'react-icons/fa';
import PageShimmer from '../../components/shared/PageShimmer';

const StudentProfileView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/institute/student/${studentId}/detail`).catch(() => ({ data: { success: false } }));
      if (res.data.success) {
        setStudent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student detail:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="detail" />;

  if (!student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <FaGraduationCap className="text-5xl text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Could not load profile data for this student.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const { student: s, attemptCount, correctCount, accuracy, submissions, examResults } = student;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FaChartLine /> },
    { key: 'assignments', label: 'Assignments', icon: <FaClipboardList /> },
    { key: 'exams', label: 'Exams', icon: <FaFileAlt /> },
  ];

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-white relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Back Button + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-full transition-colors group"
          >
            <FaArrowLeft className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
          </button>
          <h1 className="text-2xl font-black">Student Profile</h1>
        </div>

        {/* Student Info Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {s.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black">{s.name || 'Unknown Student'}</h2>
              <p className="text-gray-500 dark:text-gray-400">{s.email || ''}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2 justify-center md:justify-start">
                {s.batchYear && (
                  <span className="text-xs font-medium px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                    Batch {s.batchYear}
                  </span>
                )}
                {s.departments?.map(d => (
                  <span key={d} className="text-xs font-medium px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded-lg">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-200 dark:border-yellow-500/20">
              <FaTrophy className="text-yellow-500" />
              <span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{s.points || 0}</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-500 ml-1">points</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-500 dark:text-blue-400">{attemptCount || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Questions Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-500 dark:text-emerald-400">{accuracy || 0}%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-500 dark:text-orange-400 flex items-center justify-center gap-1">
                <FaFire className="text-xl" />{s.streak || 0}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-purple-500 dark:text-purple-400">{s.xp || 0}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Role</span>
                  <span className="font-semibold capitalize">{s.role || 'student'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Batch Year</span>
                  <span className="font-semibold">{s.batchYear || '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Points</span>
                  <span className="font-semibold text-yellow-500">{s.points || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Streak</span>
                  <span className="font-semibold text-orange-500 flex items-center gap-1"><FaFire /> {s.streak || 0} days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Correct Answers</span>
                  <span className="font-semibold text-emerald-500">{correctCount || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="text-gray-500">Joined</span>
                  <span className="font-semibold">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {(submissions?.length > 0) ? submissions.map((sub, i) => (
              <div key={sub._id || i} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base">{sub.assignmentId?.title || 'Untitled Assignment'}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      <FaClock className="inline mr-1" />
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-500">{sub.score !== undefined ? sub.score : '—'}</div>
                    <div className="text-xs text-gray-500">/ {sub.assignmentId?.totalMarks || '?'} marks</div>
                  </div>
                </div>
                {sub.teacherRemarks && (
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                    "{sub.teacherRemarks}"
                  </p>
                )}
              </div>
            )) : (
              <div className="text-center py-16 bg-white dark:bg-white/[0.03] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <FaClipboardList className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No assignments submitted yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            {(examResults?.length > 0) ? examResults.map((result, i) => (
              <div key={result._id || i} className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base">{result.examId?.title || 'Untitled Exam'}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      <FaClock className="inline mr-1" />
                      {result.examId?.scheduledAt ? new Date(result.examId.scheduledAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-500">{result.score !== undefined ? result.score : '—'}</div>
                    <div className="text-xs text-gray-500">/ {result.examId?.totalMarks || '?'} marks</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-16 bg-white dark:bg-white/[0.03] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                <FaFileAlt className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No exam results available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileView;
