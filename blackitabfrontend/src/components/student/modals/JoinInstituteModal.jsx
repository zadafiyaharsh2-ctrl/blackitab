import React, { useState, useEffect } from 'react';
import { FaBuilding, FaTimes, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../../config';
import toast from 'react-hot-toast';

const JoinInstituteModal = ({ isOpen, onClose, user }) => {
  const [joinInstituteCode, setJoinInstituteCode] = useState('');
  const [joinBatchYear, setJoinBatchYear] = useState('');
  const [joinDepartments, setJoinDepartments] = useState('');
  const [joiningInstitute, setJoiningInstitute] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [instituteName, setInstituteName] = useState('');

  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 20 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!joinInstituteCode.trim() || joinInstituteCode.length < 3) {
      setCodeVerified(false);
      setAvailableDepartments([]);
      setInstituteName('');
      return;
    }

    const verifyTimer = setTimeout(async () => {
      setVerifyingCode(true);
      try {
        const res = await axios.get(`${API_URL}/api/institute/verify/${joinInstituteCode}`);
        if (res.data.success) {
          setCodeVerified(true);
          setInstituteName(res.data.data.name);
          setAvailableDepartments(res.data.data.departments || []);
          if (res.data.data.departments && !res.data.data.departments.includes(joinDepartments)) {
            setJoinDepartments('');
          }
        } else {
          setCodeVerified(false);
          setInstituteName('');
          setAvailableDepartments([]);
        }
      } catch {
        setCodeVerified(false);
        setInstituteName('');
        setAvailableDepartments([]);
      } finally {
        setVerifyingCode(false);
      }
    }, 500);

    return () => clearTimeout(verifyTimer);
  }, [joinInstituteCode, joinDepartments]);

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!joinInstituteCode.trim()) return toast.error('Please enter an institute code');
    if (user?.role === 'student' && !joinBatchYear.trim()) return toast.error('Please enter your batch year');
    if (!joinDepartments.trim()) return toast.error('Please enter your department/division');

    setJoiningInstitute(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/institute/join`, {
        instituteCode: joinInstituteCode,
        batchYear: joinBatchYear,
        departments: joinDepartments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        onClose();
        setJoinInstituteCode('');
        setJoinBatchYear('');
        setJoinDepartments('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join institute');
    } finally {
      setJoiningInstitute(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
          <FaTimes size={16} />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
            <FaBuilding className="text-orange-500 text-xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Join an Institute</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter the institute code provided by your institute</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Institute Code</label>
            <div className="relative">
              <input
                type="text"
                value={joinInstituteCode}
                onChange={e => setJoinInstituteCode(e.target.value.toUpperCase())}
                placeholder="e.g. SURAT123"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center text-lg font-bold tracking-widest uppercase mb-1"
                autoFocus
              />
              {verifyingCode && (
                <div className="absolute right-3 top-3.5">
                  <div className="w-5 h-5 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="h-5 mb-2">
              {codeVerified && instituteName && (
                <p className="text-green-500 text-xs text-center font-medium">✓ {instituteName}</p>
              )}
              {!codeVerified && joinInstituteCode.length >= 3 && !verifyingCode && (
                <p className="text-red-500 text-xs text-center font-medium">Institute not found</p>
              )}
            </div>
          </div>

          <div className={`grid ${user?.role === 'student' ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-2`}>
            {user?.role === 'student' && (
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Batch Year</label>
                <div className="relative">
                  <select
                    value={joinBatchYear}
                    onChange={e => setJoinBatchYear(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Year</option>
                    {batchYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Department</label>
              <div className="relative">
                <select
                  value={joinDepartments}
                  onChange={e => setJoinDepartments(e.target.value)}
                  disabled={availableDepartments.length === 0 || !codeVerified}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all text-center appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {codeVerified && availableDepartments.length === 0 ? 'No Departments Found' : 'Select Dept'}
                  </option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={joiningInstitute || !joinInstituteCode.trim() || (user?.role === 'student' && !joinBatchYear.trim()) || !joinDepartments.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joiningInstitute ? (
              <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Joining...</span></>
            ) : (
              <><FaSignInAlt /><span>Join Institute</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinInstituteModal;
