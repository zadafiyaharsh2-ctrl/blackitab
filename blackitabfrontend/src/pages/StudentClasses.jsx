import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaClock, FaPlus, FaTimes, FaSpinner,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import API_URL from '../config';
import toast from 'react-hot-toast';

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
          {[['Present','bg-emerald-500'],['Absent','bg-red-500'],['Late','bg-amber-400'],['No class','bg-gray-300 dark:bg-white/15']].map(([l,c]) => (
            <span key={l} className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <span className={`w-2 h-2 rounded-full shrink-0 ${c}`}/>
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
      <div ref={scrollRef} className="overflow-x-auto px-5 py-5">
        <div className="flex items-end gap-0 min-w-max relative">
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
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${cfg.dot} ${cfg.ring} ${isToday ? 'outline outline-2 outline-offset-2 outline-gray-900 dark:outline-white' : ''}`}>
                      <span className={`text-xs font-bold ${cfg.numColor}`}>{dayNum}</span>
                    </div>
                  ) : (
                    /* No class — small gray dot */
                    <div className={`w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/15 flex items-center justify-center mx-auto mt-2 ${isToday ? 'outline outline-2 outline-offset-2 outline-gray-400' : ''}`}>
                      <span className="text-[8px] font-semibold text-gray-400">{dayNum}</span>
                    </div>
                  )}

                  {/* Day label below */}
                  <span className="text-[8px] font-semibold text-gray-400 dark:text-gray-500 mt-1 uppercase">
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


const ClassCard = ({ batch }) => {
  const [expanded, setExpanded] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const toggle = async () => {
    if (!expanded && !attendance) {
      setLoadingAttendance(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/user/batches/${batch._id}/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setAttendance(res.data.data);
      } catch {
        toast.error('Failed to load attendance');
      } finally {
        setLoadingAttendance(false);
      }
    }
    setExpanded(prev => !prev);
  };

  const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Not assigned';
  const summary = attendance?.summary;

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
      {/* Class header — always visible */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm shrink-0">
              {batch.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{batch.name}</h3>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><FaChalkboardTeacher /> {teachers}</span>
                {batch.year && <span className="flex items-center gap-1"><FaCalendarAlt /> Year {batch.year}</span>}
                {batch.section && <span className="px-1.5 py-0.5 border border-gray-200 dark:border-white/10 rounded text-gray-600 dark:text-gray-400">Section {batch.section}</span>}
                {batch.classCode && (
                  <span className="font-mono px-1.5 py-0.5 border border-gray-200 dark:border-white/10 rounded text-gray-500">
                    Code: {batch.classCode}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={toggle}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 shrink-0"
            title={expanded ? 'Hide attendance' : 'View attendance'}
          >
            {expanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>
        </div>

        {/* Quick attendance bar — always show if loaded */}
        {summary && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500">Attendance</span>
              <span className={`text-xs font-bold ${
                summary.attendancePercent >= 75 ? 'text-emerald-600 dark:text-emerald-400' :
                summary.attendancePercent >= 50 ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {summary.attendancePercent !== null ? `${summary.attendancePercent}%` : 'No data'}
              </span>
            </div>
            <AttendanceBar percent={summary.attendancePercent} />
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><FaCheckCircle className="text-emerald-500" /> {summary.present} present</span>
              <span className="flex items-center gap-1"><FaTimesCircle className="text-red-500" /> {summary.absent} absent</span>
              {summary.late > 0 && <span className="flex items-center gap-1"><FaClock className="text-amber-500" /> {summary.late} late</span>}
            </div>
          </div>
        )}
        {!summary && !loadingAttendance && !expanded && (
          <p className="text-xs text-gray-400 mt-3 italic">Click ↓ to view attendance</p>
        )}
      </div>

      {/* Expanded session timeline */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {loadingAttendance ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-gray-400 text-lg" />
            </div>
          ) : attendance?.sessions?.length > 0 ? (
            <AttendanceTimeline sessions={attendance.sessions} />
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No attendance records found for this class yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StudentClasses = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/user/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBatches(res.data.data);
    } catch {
      toast.error('Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) return;
    setJoining(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/user/batch/join`, { classCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setShowJoinModal(false);
        setClassCode('');
        fetchBatches();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join class');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pt-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AcademicCapIcon className="w-5 h-5 text-gray-400" />
            My Classes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your enrolled classes and attendance records</p>
        </div>
        <button
          onClick={() => setShowJoinModal(true)}
          className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FaPlus className="text-xs" /> Join Another Class
        </button>
      </div>

      {/* Class Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
        </div>
      ) : batches.length === 0 ? (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl text-center py-14 bg-white dark:bg-white/[0.02]">
          <FaUsers className="text-3xl text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white text-sm">No classes yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">You haven't joined any classes. Use the button below to get started.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold"
          >
            Join a Class
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map(batch => <ClassCard key={batch._id} batch={batch} />)}
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Join a Class</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleJoin} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono tracking-widest bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center uppercase"
                />
              </div>
              <p className="text-xs text-gray-400">Your teacher will approve your join request.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={joining || classCode.length < 6}
                  className="flex-1 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {joining ? <FaSpinner className="animate-spin" /> : null} Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentClasses;
