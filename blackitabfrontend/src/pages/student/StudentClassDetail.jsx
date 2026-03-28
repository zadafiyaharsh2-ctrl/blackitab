import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import API_URL from '../../config';
import toast from 'react-hot-toast';
import PageShimmer from '../../components/shared/PageShimmer';
import ClassDetailHeader from '../../components/student/pages/classDetail/ClassDetailHeader';
import ClassDetailTabs from '../../components/student/pages/classDetail/ClassDetailTabs';

// ─── Attendance timeline constants ──────────────────────────────────
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

const toKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const AttendanceTimeline = ({ sessions }) => {
  const scrollRef = React.useRef(null);

  const sessionMap = {};
  sessions.forEach(s => {
    const k = toKey(new Date(s.date));
    sessionMap[k] = s.status;
  });

  const dates = sessions.map(s => new Date(s.date));
  const earliest = dates.length ? new Date(Math.min(...dates)) : new Date();
  const today = new Date();
  earliest.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  const allDays = [];
  for (let d = new Date(earliest); d <= today; d.setDate(d.getDate() + 1)) {
    allDays.push(new Date(d));
  }

  const present = sessions.filter(s => s.status === 'Present').length;
  const absent  = sessions.filter(s => s.status === 'Absent').length;
  const late    = sessions.filter(s => s.status === 'Late').length;

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div>
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

      <div ref={scrollRef} className="overflow-x-auto px-5 py-5 custom-scrollbar">
        <div className="flex items-end gap-0 min-w-max relative pb-2">
          <div className="absolute left-0 right-0 top-[28px] h-px bg-gray-200 dark:bg-white/10 z-0" />
          {allDays.map((d, i) => {
            const key    = toKey(d);
            const status = sessionMap[key];
            const cfg    = STATUS_CONFIG[status];
            const isToday = toKey(d) === toKey(new Date());
            const isMonthStart = d.getDate() === 1 || i === 0;
            const dayNum   = d.getDate();
            const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
            const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            return (
              <div key={key} className="flex flex-col items-center relative z-10" style={{ minWidth: '44px' }}>
                {isMonthStart ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 whitespace-nowrap">
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                ) : (
                  <span className="mb-1 h-[13px]" />
                )}

                <div className="group relative flex flex-col items-center">
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
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.dot} ${cfg.ring} cursor-pointer ${isToday ? 'ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-2 !ring-gray-900 dark:!ring-white' : ''}`}>
                      <span className={`text-xs font-bold ${cfg.numColor}`}>{dayNum}</span>
                    </div>
                  ) : (
                    <div className={`w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/15 cursor-pointer flex items-center justify-center mx-auto mt-2 ${isToday ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : ''}`}>
                      <span className={`text-[8px] font-semibold ${isToday ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>{dayNum}</span>
                    </div>
                  )}

                  <span className={`text-[8px] font-semibold mt-1 uppercase ${cfg ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {dayShort}
                  </span>

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

// ─── Feedback Modal ─────────────────────────────────────────────────
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
        batchId: batch._id, teacherId, rating, comment, isAnonymous
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

// ─── Main Page Component ────────────────────────────────────────────
const StudentClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const [batch, setBatch] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [materials, setMaterials] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [exams, setExams] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [batchRes, attRes, matRes, assignRes, examRes] = await Promise.all([
        axios.get(`${API_URL}/api/user/batches/${classId}`, { headers }),
        axios.get(`${API_URL}/api/user/batches/${classId}/attendance`, { headers }),
        axios.get(`${API_URL}/api/user/batches/${classId}/materials`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/user/batches/${classId}/assignments`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/api/user/batches/${classId}/exams`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);
      
      if (batchRes.data.success) setBatch(batchRes.data.data);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (matRes.data.success) setMaterials(matRes.data.data);
      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (examRes.data.success) setExams(examRes.data.data);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">
      <ClassDetailHeader 
        batch={batch} 
        summary={summary}
        onBack={() => navigate('/classes')}
        onFeedback={() => setShowFeedbackModal(true)}
      />

      <ClassDetailTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classId={classId}
        attendance={attendance}
        materials={materials}
        assignments={assignments}
        exams={exams}
        AttendanceTimeline={AttendanceTimeline}
      />

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        batch={batch} 
      />
    </div>
  );
};

export default StudentClassDetail;
