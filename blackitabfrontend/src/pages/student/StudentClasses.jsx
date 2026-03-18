import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers, FaChalkboardTeacher, FaCalendarAlt, 
  FaPlus, FaTimes, FaSpinner, FaChevronRight
} from 'react-icons/fa';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import API_URL from '../../config';
import toast from 'react-hot-toast';

const ClassCard = ({ batch }) => {
  const navigate = useNavigate();
  const teachers = batch.teacherIds?.map(t => t.name).join(', ') || 'Not assigned';

  return (
    <div 
      onClick={() => navigate(`/classes/${batch._id}`)}
      className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02] cursor-pointer hover:border-blue-500/30 dark:hover:border-blue-500/50 transition-all hover:shadow-md group"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-900 group-hover:bg-blue-600 dark:bg-white dark:group-hover:bg-blue-500 transition-colors flex items-center justify-center text-white dark:text-gray-900 font-bold text-lg shrink-0 shadow-sm">
            {batch.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{batch.name}</h3>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5"><FaChalkboardTeacher /> {teachers}</span>
              {batch.year && <span className="flex items-center gap-1.5"><FaCalendarAlt /> Year {batch.year}</span>}
              {batch.section && <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-md">Section {batch.section}</span>}
            </div>
          </div>
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors flex items-center gap-1.5 text-sm font-semibold mr-2 bg-gray-50 dark:bg-white/5 py-1.5 px-3 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10">
          View Details <FaChevronRight className="text-xs" />
        </div>
      </div>
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
          className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold flex items-center gap-1.5 self-start sm:self-auto hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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
        <div className="border border-gray-200 dark:border-white/10 rounded-xl text-center py-14 bg-white dark:bg-white/[0.02] shadow-sm">
          <FaUsers className="text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="font-semibold text-gray-900 dark:text-white text-base">No classes yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">You haven't joined any classes. Use the button below to get started.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            Join a Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {batches.map(batch => <ClassCard key={batch._id} batch={batch} />)}
        </div>
      )}

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowJoinModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Join a Class</h3>
              <button onClick={() => setShowJoinModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleJoin} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Class Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={classCode}
                  onChange={e => setClassCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-mono tracking-[0.2em] bg-gray-50 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-center uppercase"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Your teacher will need to approve your join request.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={joining || classCode.length < 6}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center justify-center gap-2 transition-colors shadow-sm">
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
