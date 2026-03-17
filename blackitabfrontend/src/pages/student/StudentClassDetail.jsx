import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChalkboardTeacher, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaClock, FaSpinner,
  FaBookOpen, FaLink, FaFileAlt, FaArrowLeft, FaStar, FaClipboardList
} from 'react-icons/fa';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import API_URL from '../../config';
import toast from 'react-hot-toast';
import PageShimmer from '../../components/shared/PageShimmer';

const AttendanceBar = ({ percent }) => {
  const color = percent >= 75 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent ?? 0}%` }} />
    </div>
  );
};

const STATUS_CONFIG = {
  Present: {
    dot: 'bg-emerald-500 shadow-emerald-500/40 shadow-md',
    ring: 'ring-2 ring-emerald-200 dark:ring-emerald-500/30',
    numColor: 'text-white',
    label: 'text-emerald-600 dark:text-emerald-400',
    big: true,
  },
  Absent: {
    dot: 'bg-red-500 shadow-red-500/40 shadow-md',
    ring: 'ring-2 ring-red-200 dark:ring-red-500/30',
    numColor: 'text-white',
    label: 'text-red-500 dark:text-red-400',
    big: true,
  },
  Late: {
    dot: 'bg-amber-400 shadow-amber-400/40 shadow-md',
    ring: 'ring-2 ring-amber-200 dark:ring-amber-400/30',
    numColor: 'text-white',
    label: 'text-amber-500 dark:text-amber-300',
    big: true,
  },
};

// Helper: strip time from a Date → "YYYY-MM-DD" key
const toKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const AttendanceTimeline = ({ sessions }) => {
  const scrollRef = React.useRef(null);

  // Build session lookup keyed by date string
  const sessionMap = {};
  sessions.forEach(s => {
    const k = toKey(new Date(s.date));
    sessionMap[k] = s.status;
  });

  // Date range: first session → today
  const dates = sessions.map(s => new Date(s.date));
  const earliest = dates.length ? new Date(Math.min(...dates)) : new Date();
  const today = new Date();
  earliest.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  // Generate ALL calendar days
  const allDays = [];
  for (let d = new Date(earliest); d <= today; d.setDate(d.getDate() + 1)) {
    allDays.push(new Date(d));
  }

  // Summary counts
  const present = sessions.filter(s => s.status === 'Present').length;
  const absent  = sessions.filter(s => s.status === 'Absent').length;
  const late    = sessions.filter(s => s.status === 'Late').length;

  // Auto-scroll to the right (most recent = rightmost)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div>
      {/* Header: Legend + summary */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          {[['Present','bg-emerald-500','✓'],['Absent','bg-red-500','✕'],['Late','bg-amber-400','◷'],['No class','bg-gray-300 dark:bg-white/15','']].map(([l,c,icon]) => (
            <span key={l} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              <span className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center text-[8px] font-bold text-white ${c}`}>{icon}</span>
              {l}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          {present > 0 && <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{present} P</span>}
          {absent  > 0 && <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400">{absent} A</span>}
          {late    > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">{late} L</span>}
        </div>
      </div>

      {/* Single scrollable strip */}
      <div ref={scrollRef} className="overflow-x-auto px-5 py-5 custom-scrollbar">
        <div className="flex items-end gap-0 min-w-max relative pb-2">
          {/* Baseline timeline rail */}
          <div className="absolute left-0 right-0 top-[28px] h-px bg-gray-200 dark:bg-white/10 z-0" />

          {allDays.map((d, i) => {
            const key    = toKey(d);
            const status = sessionMap[key]; // undefined = no class
            const cfg    = STATUS_CONFIG[status];
            const isToday = toKey(d) === toKey(new Date());

            // Month boundary label
            const isMonthStart = d.getDate() === 1 || i === 0;

            const dayNum   = d.getDate();
            const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
            const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            return (
              <div key={key} className="flex flex-col items-center relative z-10" style={{ minWidth: '44px' }}>
                {/* Month label above on 1st of month */}
                {isMonthStart ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 whitespace-nowrap">
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                ) : (
                  <span className="mb-1 h-[13px]" />
                )}

                {/* Dot + tooltip */}
                <div className="group relative flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-30 pointer-events-none">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                      <div>{fullDate}</div>
                      <div className={`mt-0.5 font-bold ${
                        status === 'Present' ? 'text-emerald-300 dark:text-emerald-600' :
                        status === 'Absent'  ? 'text-red-300 dark:text-red-500' :
                        status === 'Late'    ? 'text-amber-300 dark:text-amber-500' :
                        'text-gray-400'
                      }`}>{status || 'No class'}</div>
                    </div>
                    <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45 mx-auto -mt-1" />
                  </div>

                  {cfg ? (
                    /* Recorded session — big dot */
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.dot} ${cfg.ring} cursor-pointer ${isToday ? 'ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-2 !ring-gray-900 dark:!ring-white' : ''}`}>
                      <span className={`text-xs font-bold ${cfg.numColor}`}>{dayNum}</span>
                    </div>
                  ) : (
                    /* No class — small gray dot */
                    <div className={`w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/15 cursor-pointer flex items-center justify-center mx-auto mt-2 ${isToday ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : ''}`}>
                      <span className={`text-[8px] font-semibold ${isToday ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>{dayNum}</span>
                    </div>
                  )}

                  {/* Day label below */}
                  <span className={`text-[8px] font-semibold mt-1 uppercase ${cfg ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {dayShort}
                  </span>

                  {/* Status label */}
                  {cfg && (
                    <span className={`text-[8px] font-bold mt-0.5 ${cfg.label}`}>
                      {status.slice(0,3).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const FeedbackModal = ({ isOpen, onClose, batch }) => {
  const [teacherId, setTeacherId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeacherId('');
      setRating(0);
      setComment('');
      setIsAnonymous(false);
      // Auto-select if only one teacher
      if (batch?.teacherIds?.length === 1) {
        setTeacherId(batch.teacherIds[0]._id);
      }
    }
  }, [isOpen, batch]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || rating === 0) {
      return toast.error('Please select a teacher and give a rating');
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/feedback/batch`, {
        batchId: batch._id,
        teacherId,
        rating,
        comment,
        isAnonymous
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feedback submitted successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Teacher Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Teacher</label>
              <select 
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a teacher...</option>
                {batch?.teacherIds?.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                   <button
                     type="button"
                     key={star}
                     onClick={() => setRating(star)}
                     className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                   >
                     ★
                   </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What did you like or dislike?"
              ></textarea>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Submit Anonymously</span>
            </label>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StudentClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'materials'
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const [batch, setBatch] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [assignments, setAssignments] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [batchRes, attRes, matRes, assignRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/batches/${classId}`, { headers }),
        axios.get(`${API_URL}/api/user/batches/${classId}/attendance`, { headers }),
        axios.get(`${API_URL}/api/user/batches/${classId}/materials`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/user/batches/${classId}/assignments`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);
      
      if (batchRes.data.success) setBatch(batchRes.data.data);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (matRes.data.success) setMaterials(matRes.data.data);
      if (assignRes.data.success) setAssignments(assignRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load class details');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageShimmer variant="detail" />;

  if (!batch) return null;

  const summary = attendance?.summary;
  const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Not assigned';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
        {/* Back nav inside card */}
        <button
          onClick={() => navigate('/classes')}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <FaArrowLeft className="text-[10px]" /> Back to Classes
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <AcademicCapIcon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{batch.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5 font-medium"><FaChalkboardTeacher className="text-gray-400" /> {teachers}</span>
              {batch.year && <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-gray-400" /> Year {batch.year}</span>}
              {batch.section && <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md font-medium text-gray-600 dark:text-gray-300">Sec {batch.section}</span>}
              {batch.classCode && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md font-mono text-gray-600 dark:text-gray-300 text-[11px]">
                  {batch.classCode}
                </span>
              )}
            </div>
          </div>
        </div>
              
        {/* Quick Attendance Overview */}
        {summary && (
          <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">My Attendance</span>
              <span className={`text-sm font-bold ${
                summary.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
                summary.attendancePercent >= 50 ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {summary.attendancePercent !== null ? `${summary.attendancePercent}%` : 'No data'}
              </span>
            </div>
            <AttendanceBar percent={summary.attendancePercent} />
            <div className="flex gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5"><FaCheckCircle className="text-emerald-500 text-[10px]" /> {summary.present} Present</span>
              <span className="flex items-center gap-1.5"><FaTimesCircle className="text-red-500 text-[10px]" /> {summary.absent} Absent</span>
              {summary.late > 0 && <span className="flex items-center gap-1.5"><FaClock className="text-amber-500 text-[10px]" /> {summary.late} Late</span>}
            </div>
          </div>
        )}

        {/* Feedback link — contextual to this class */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="mt-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors font-medium"
        >
          <FaStar className="text-yellow-400 text-[10px]" /> Rate your teachers
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-white/[0.02] shadow-sm">
        {/* Tabs header */}
        <div className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-transparent">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'attendance'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600 dark:bg-white/[0.05] dark:text-blue-400 dark:border-blue-400 shadow-[0_4px_0_0_transparent]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.02]'
            }`}
          >
            <FaCalendarAlt /> Attendance History
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'materials'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600 dark:bg-white/[0.05] dark:text-blue-400 dark:border-blue-400 shadow-[0_4px_0_0_transparent]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.02]'
            }`}
          >
            <FaBookOpen /> Course Materials ({materials?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-4 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'assignments'
                ? 'text-blue-600 bg-white border-b-2 border-blue-600 dark:bg-white/[0.05] dark:text-blue-400 dark:border-blue-400 shadow-[0_4px_0_0_transparent]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/[0.02]'
            }`}
          >
            <FaClipboardList /> Assignments ({assignments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {/* Attendance View */}
          {activeTab === 'attendance' && (
            attendance?.sessions?.length > 0 ? (
              <AttendanceTimeline sessions={attendance.sessions} />
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCalendarAlt className="text-2xl text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No Attendance Records</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance hasn't been taken in this class yet.</p>
              </div>
            )
          )}

          {/* Materials View */}
          {activeTab === 'materials' && (
            <div className="p-6">
              {materials?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {materials.map(material => (
                    <div 
                      key={material._id} 
                      onClick={() => navigate(`/classes/${classId}/material/${material._id}`)}
                      className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group cursor-pointer flex flex-col h-full"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                          <FaBookOpen />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{material.title}</h3>
                          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            {material.links?.length > 0 && <span>{material.links.length} Links</span>}
                            {material.files?.length > 0 && <span>{material.files.length} Files</span>}
                          </div>
                        </div>
                      </div>
                      
                      {material.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-grow">{material.description}</p>}
                      
                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">Open Material &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-16 text-center">
                  <FaBookOpen className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">No class materials yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teachers haven't added any study materials for this class.</p>
                </div>
              )}
            </div>
          )}

          {/* Assignments View */}
          {activeTab === 'assignments' && (
            <div className="p-6">
              {assignments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignments.map(assignment => (
                    <div 
                      key={assignment._id} 
                      onClick={() => navigate(`/classes/${classId}/assignment/${assignment._id}`)}
                      className="border border-gray-200 dark:border-white/10 rounded-xl p-5 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 transition-all group cursor-pointer flex flex-col h-full"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                          <FaClipboardList />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-base truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{assignment.title}</h3>
                          <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            <span>Total Marks: {assignment.totalMarks}</span>
                            <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'None'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {assignment.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-grow">{assignment.description}</p>}
                      
                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 group-hover:underline">View Assignment &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-16 text-center">
                  <FaClipboardList className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">No assignments yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Teachers haven't added any assignments for this class.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        batch={batch} 
      />

    </div>
  );
};

export default StudentClassDetail;
