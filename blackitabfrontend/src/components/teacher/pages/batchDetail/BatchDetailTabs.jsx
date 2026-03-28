import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaUserTimes, FaSpinner, FaTrash, FaBookOpen, FaPlus, FaLink, FaFileAlt, FaEdit, FaClipboardList, FaSearch, FaArrowLeft } from 'react-icons/fa';

const BatchDetailTabs = ({
  batchId, batch, activeTab, students, materials, assignments, requests,
  attendanceData, searchQuery, setSearchQuery, searchResults, searching,
  handleApproveRequest, handleRejectRequest, handleRemoveStudent, handleAddManually, goToStudentProfile
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[400px]">
      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {students.map(student => {
                const a = attendanceData[student._id];
                const pct = a ? Math.round(a.attendancePercentage) : null;
                return (
                  <div key={student._id} onClick={() => goToStudentProfile(student._id)}
                    className="group relative bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-[#0061FF]/30 dark:hover:border-white/20 transition-all cursor-pointer overflow-hidden flex items-center justify-between">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gray-100 dark:bg-white/5 group-hover:bg-[#0061FF] dark:group-hover:bg-[#a5c3ff] transition-colors duration-500" />
                    <div className="flex items-center gap-4 pl-2">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm text-gray-500 dark:text-gray-300 font-black text-sm group-hover:bg-white dark:group-hover:bg-[#05000a] transition-colors">
                          {student.profileImage ? <img src={student.profileImage} alt="" className="w-full h-full object-cover" /> : student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        {pct !== null && pct < 75 && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-[3px] border-white dark:border-[#05000a] flex items-center justify-center text-white text-[10px] font-black shadow-sm" title="Low Attendance">!</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{student.name}</p>
                        <p className="text-[11px] font-medium text-gray-500 font-mono mt-0.5 truncate">{student.email}</p>
                        {a ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[10px] font-black tracking-widest ${pct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>{pct}% RATE</span>
                            <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{a.presentCount}/{a.totalClasses} Logged</span>
                          </div>
                        ) : <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1.5">Awaiting Telemetry</p>}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveStudent(student._id); }}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-105 shrink-0">
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] p-16 text-center max-w-3xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-white/5">
                <FaUserTimes className="text-3xl text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Zero Capacity</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
                Distribute this registration cipher: <strong className="text-[#0061FF] dark:text-[#a5c3ff] font-mono mx-1">{batch.classCode}</strong> to permit entry maneuvers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex justify-end">
            <button onClick={() => navigate(`/teacher/batch/${batchId}/materials/new`)}
              className="px-6 py-3 bg-[#0061FF] text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#004bcc] transition-colors shadow-lg shadow-[#0061FF]/20 flex items-center gap-2">
              <FaPlus /> Author Literature
            </button>
          </div>
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(material => (
                <div key={material._id} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 shadow-sm transition-transform group-hover:scale-105">
                      <FaBookOpen className="text-lg" />
                    </div>
                    <button onClick={() => navigate(`/teacher/batch/${batchId}/materials/edit/${material._id}`)}
                      className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-[#0061FF] hover:border-[#0061FF]/30 hover:bg-[#0061FF]/5 dark:hover:text-[#a5c3ff] dark:hover:bg-white/5 transition-all">
                      <FaEdit className="text-xs" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-2 line-clamp-1 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{material.title}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {material.links?.length || 0} External • {material.files?.length || 0} Volumes
                    </p>
                    {material.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed">{material.description}</p>}
                  </div>
                  <div className="space-y-2 mt-auto">
                    {material.links?.slice(0, 2).map((link, idx) => (
                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-[#0061FF] dark:hover:text-[#a5c3ff] hover:border-[#0061FF]/30 transition-colors">
                        <FaLink className="text-[#0061FF]/50 dark:text-[#a5c3ff]/50 shrink-0" /> <span className="truncate">{link}</span>
                      </a>
                    ))}
                    {material.files?.slice(0, 2).map((file, idx) => (
                      <a key={idx} href={file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full p-3 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10 rounded-xl text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 transition-colors">
                        <FaFileAlt className="text-emerald-500/50 dark:text-emerald-400/50 shrink-0" /> <span className="truncate">Resource Vol. {idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] p-16 text-center max-w-3xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-white/5"><FaBookOpen className="text-3xl text-gray-300 dark:text-gray-600" /></div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Barren Archives</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">Publish curriculum links, syllabi, and reference documents to populate the literature repository.</p>
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex justify-end">
            <button onClick={() => navigate(`/teacher/batch/${batchId}/assignments/new`)}
              className="px-6 py-3 bg-gray-900 border-2 border-transparent text-white dark:bg-white dark:text-gray-900 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-900/10 flex items-center gap-2">
              <FaPlus /> Author Evaluation
            </button>
          </div>
          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map(assignment => (
                <div key={assignment._id} onClick={() => navigate(`/teacher/assignment/${assignment._id}`)}
                  className="group cursor-pointer bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-300 dark:hover:border-amber-500/30 transition-all relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/10 dark:from-amber-500/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-14 h-14 rounded-[1.2rem] bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0 shadow-sm transition-transform group-hover:scale-110">
                        <FaClipboardList className="text-xl" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-widest mb-1 shadow-sm">Evaluation Instance</p>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight line-clamp-1">{assignment.title}</h3>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/teacher/batch/${batchId}/assignments/edit/${assignment._id}`); }}
                      className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-500/10 transition-all z-10">
                      <FaEdit className="text-sm" />
                    </button>
                  </div>
                  {assignment.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-8 pl-2">{assignment.description}</p>}
                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Max Yield</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white font-mono tracking-tight">{assignment.totalMarks} XP</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Terminal Date</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-1 tracking-tight">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Indefinite'}</p>
                    </div>
                  </div>
                  <div className="absolute opacity-0 group-hover:opacity-100 right-8 bottom-8 transition-opacity text-amber-500 dark:text-amber-400 text-sm font-bold flex items-center gap-1.5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-amber-200 dark:border-amber-500/20 shadow-sm">
                    Grade Vault <FaArrowLeft className="rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] p-16 text-center max-w-3xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-white/5"><FaClipboardList className="text-3xl text-gray-300 dark:text-gray-600" /></div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">No Active Evaluations</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">Design and deploy assignments to test operational fidelity and extract performance analytics.</p>
            </div>
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {requests.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-[#0061FF]/10 border border-blue-200 dark:border-[#0061FF]/20 rounded-2xl p-4 flex items-center gap-4 text-sm font-medium text-blue-800 dark:text-blue-300 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-2" />
                {requests.length} learners are waiting for your clearance to access the registry.
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {requests.map(req => (
                  <div key={req._id} onClick={() => goToStudentProfile(req.studentId?._id)}
                    className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer relative flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm text-gray-500 dark:text-gray-300 font-black text-lg">
                        {req.studentId?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0 pr-4">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">{req.studentId?.name || 'Unknown Protocol'}</p>
                        <p className="text-xs font-medium text-gray-500 font-mono mt-0.5 truncate">{req.studentId?.email}</p>
                        <p className="text-[9px] font-bold text-[#0061FF] dark:text-[#a5c3ff] uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#0061FF] dark:bg-[#a5c3ff] animate-ping" /> Active Signal
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleRejectRequest(req._id); }}
                        className="flex-1 sm:flex-none px-6 py-3 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        Deny
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleApproveRequest(req._id); }}
                        className="flex-1 sm:flex-none px-6 py-3 bg-[#0061FF] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-md shadow-[#0061FF]/20 hover:bg-[#004bcc] transition-colors">
                        Grant Access
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 rounded-[3rem] p-16 text-center max-w-3xl mx-auto shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-white/5"><FaUserCheck className="text-3xl text-gray-300 dark:text-gray-600" /></div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">Cleared Sector</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">No active student matriculation requests present in the operations queue.</p>
            </div>
          )}
        </div>
      )}

      {/* ADD STUDENTS TAB */}
      {activeTab === 'add' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[3rem] p-8 sm:p-14 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />
            <div className="text-center mb-12 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#0061FF] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0061FF]/30">
                <FaUserPlus className="text-white text-xl" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Populate Registry</h3>
              <p className="text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
                Query the institutional database to directly inject personnel, or broadcast your class cipher: <strong className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded shadow-sm font-mono mx-1">{batch.classCode}</strong>
              </p>
            </div>
            <div className="relative mb-10 z-10">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FaSearch className="text-[#0061FF] dark:text-[#a5c3ff] text-base" />
              </div>
              <input type="text" placeholder="Search query (Name or Email signature)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-full py-5 pl-14 pr-6 text-[15px] font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#0061FF]/10 focus:border-[#0061FF]/30 transition-all shadow-inner" />
              {searching && (
                <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                  <FaSpinner className="animate-spin text-gray-400 text-lg" />
                </div>
              )}
            </div>
            <div className="space-y-4 min-h-[200px] relative z-10">
              {searchResults.length > 0 ? (
                searchResults.map(s => (
                  <div key={s._id} onClick={() => goToStudentProfile(s._id)}
                    className="flex items-center justify-between border border-gray-100 dark:border-white/5 rounded-3xl p-4 cursor-pointer hover:border-[#0061FF]/30 dark:hover:border-white/20 bg-white dark:bg-white/[0.01] hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors group shadow-sm hover:shadow">
                    <div className="flex items-center gap-5 pl-2">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-base font-black text-gray-700 dark:text-gray-300 shadow-sm overflow-hidden group-hover:bg-white dark:group-hover:bg-[#05000a] transition-colors">
                        {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors">{s.name}</p>
                        <p className="text-[11px] font-medium text-gray-400 font-mono mt-0.5">{s.email}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleAddManually(s._id); }}
                      className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2 transform hover:scale-105 mr-2">
                      <FaPlus /> Inject
                    </button>
                  </div>
                ))
              ) : searchQuery.length >= 2 && !searching ? (
                <div className="h-full flex items-center justify-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.01]">
                  <p className="text-center text-[13px] font-medium text-gray-400 uppercase tracking-widest">Null Query Result: "{searchQuery}"</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.01]">
                  <p className="text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 opacity-60">Awaiting Sub-Routine Parameters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetailTabs;
