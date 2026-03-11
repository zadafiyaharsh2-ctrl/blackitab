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

const STATUS_STYLE = {
  Present: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30',
  Absent:  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',
  Late:    'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30',
};

const AttendanceBar = ({ percent }) => {
  const color = percent >= 75 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${percent ?? 0}%` }} />
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

      {/* Expanded session list */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5">
          {loadingAttendance ? (
            <div className="flex items-center justify-center py-6">
              <FaSpinner className="animate-spin text-gray-400 text-lg" />
            </div>
          ) : attendance?.sessions?.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/5 max-h-64 overflow-y-auto">
              {attendance.sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLE[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
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
