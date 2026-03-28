import React from 'react';
import { FaSearch, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

const UsersTab = ({
  userSearch, setUserSearch, fetchUsers, 
  setShowCreateUser, showCreateUser, newUser, setNewUser, handleCreateUser,
  editUserModal, setEditUserModal, editUserTab, setEditUserTab, handleEditUser,
  filteredUsers, handleRoleChange, handleBan, setSelectedTeacherForFeedback, setIsFeedbackModalOpen, openDeleteModal,
  Pagination, userPagination, userPage, setUserPage
}) => {
  const normalizeRole = (role) => String(role || '').trim().toLowerCase();

  const formatRoleLabel = (role) => {
    const normalized = normalizeRole(role);
    if (normalized === 'hod') return 'HOD';
    if (normalized === 'institute_admin') return 'Institute Admin';
    if (normalized === 'institute') return 'Institute';
    if (!normalized) return 'Unknown';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const getRoleOptions = (currentRole) => {
    const normalized = normalizeRole(currentRole);
    if (normalized === 'teacher') return ['teacher', 'hod'];
    if (normalized === 'hod') return ['hod', 'teacher'];
    return [normalized || 'student'];
  };

  const isRoleLocked = (currentRole) => !['teacher', 'hod'].includes(normalizeRole(currentRole));

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={userSearch} onChange={e => { setUserSearch(e.target.value); fetchUsers(null, 1, e.target.value); }}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-blue-500/50" />
        </div>
        <button onClick={() => setShowCreateUser(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-colors whitespace-nowrap">
          <FaPlus /> Create User
        </button>
      </div>

      {/* Create User Form */}
      {showCreateUser && (
        <div className="glass-panel p-6 border-blue-500/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Create New User</h3>
            <button onClick={() => setShowCreateUser(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Full Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email" type="email" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <input value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Password (min 6 chars)" type="text" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
              <option value="student" className="bg-gray-900">Student</option>
              <option value="teacher" className="bg-gray-900">Teacher</option>
              <option value="hod" className="bg-gray-900">HOD</option>
              <option value="institute" className="bg-gray-900">Institute Admin</option>
            </select>
            <input value={newUser.instituteCode} onChange={e => setNewUser({ ...newUser, instituteCode: e.target.value.toUpperCase() })}
              placeholder="Institute Code (optional)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none uppercase" />
          </div>
          <button onClick={handleCreateUser}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors">
            Create User
          </button>
        </div>
      )}

      {/* Comprehensive Edit User Modal */}
      <>
      {editUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {editUserModal.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Edit Profile: {editUserModal.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{editUserModal._id}</p>
                </div>
              </div>
              <button onClick={() => setEditUserModal(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><FaTimes /></button>
            </div>

            {/* Tabs */}
            <div className="flex px-5 border-b border-white/5 bg-white/[0.01]">
              {['general', 'academic', 'profile', 'metrics'].map(tab => (
                <button key={tab} onClick={() => setEditUserTab(tab)}
                  className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 ${editUserTab === tab ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {editUserTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                      <input value={editUserModal.name || ''} onChange={e => setEditUserModal({ ...editUserModal, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email (Login ID)</label>
                      <input value={editUserModal.email || ''} onChange={e => setEditUserModal({ ...editUserModal, email: e.target.value })} type="email"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editUserModal.isVerified || false} onChange={e => setEditUserModal({ ...editUserModal, isVerified: e.target.checked })} 
                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-gray-300">Account Verified</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editUserModal.isBanned || false} onChange={e => setEditUserModal({ ...editUserModal, isBanned: e.target.checked })} 
                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-red-500 focus:ring-red-500" />
                      <span className="text-sm font-medium text-red-400">Account Banned</span>
                    </label>
                  </div>
                </div>
              )}

              {editUserTab === 'academic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Role</label>
                      <select
                        value={editUserModal.role || 'student'}
                        disabled={isRoleLocked(editUserModal.role)}
                        onChange={e => setEditUserModal({ ...editUserModal, role: e.target.value })}
                        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none ${isRoleLocked(editUserModal.role) ? 'opacity-70 cursor-not-allowed' : 'focus:border-blue-500/50'}`}
                      >
                        {getRoleOptions(editUserModal.role).map(r => (
                          <option key={r} value={r} className="bg-gray-900">{formatRoleLabel(r)}</option>
                        ))}
                      </select>
                      {isRoleLocked(editUserModal.role) && (
                        <p className="text-[11px] text-amber-400 mt-1">Role locked. Only Teacher and HOD can be switched.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Institute Code</label>
                      <input value={editUserModal.instituteCode || ''} onChange={e => setEditUserModal({ ...editUserModal, instituteCode: e.target.value.toUpperCase() })} 
                        placeholder="Leave blank to unbind"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none uppercase font-mono focus:border-blue-500/50" />
                    </div>
                  </div>
                  {['student'].includes(editUserModal.role) && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Batch Year</label>
                          <input value={editUserModal.batchYear || ''} onChange={e => setEditUserModal({ ...editUserModal, batchYear: e.target.value })} 
                             placeholder="e.g. 2026" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Division</label>
                          <input value={editUserModal.division || ''} onChange={e => setEditUserModal({ ...editUserModal, division: e.target.value })} 
                             placeholder="e.g. A" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                       </div>
                    </div>
                  )}
                  {['teacher', 'hod'].includes(editUserModal.role) && (
                    <div className="pt-2">
                       <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Specialization (Optional)</label>
                       <input value={editUserModal.specialization || ''} onChange={e => setEditUserModal({ ...editUserModal, specialization: e.target.value })} 
                          placeholder="e.g. Advanced Physics" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                    </div>
                  )}
                </div>
              )}

              {editUserTab === 'profile' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bio (Max 160 chars)</label>
                    <textarea value={editUserModal.bio || ''} onChange={e => setEditUserModal({ ...editUserModal, bio: e.target.value })}
                      rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none resize-none focus:border-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Profile Image URL</label>
                    <input value={editUserModal.profileImage || ''} onChange={e => setEditUserModal({ ...editUserModal, profileImage: e.target.value })}
                      placeholder="https://..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editUserModal.isPrivate || false} onChange={e => setEditUserModal({ ...editUserModal, isPrivate: e.target.checked })} 
                        className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-300">Private Profile View</span>
                    </label>
                  </div>
                </div>
              )}

              {editUserTab === 'metrics' && (
                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-yellow-500/80 uppercase mb-1">Level Points</label>
                      <input type="number" value={editUserModal.points || 0} onChange={e => setEditUserModal({ ...editUserModal, points: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-yellow-400 font-bold outline-none focus:border-yellow-500/50" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-cyan-500/80 uppercase mb-1">Experience (XP)</label>
                      <input type="number" value={editUserModal.xp || 0} onChange={e => setEditUserModal({ ...editUserModal, xp: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-cyan-400 font-bold outline-none focus:border-cyan-500/50" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-orange-500/80 uppercase mb-1">Active Streak</label>
                      <input type="number" value={editUserModal.streak || 0} onChange={e => setEditUserModal({ ...editUserModal, streak: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-orange-400 font-bold outline-none focus:border-orange-500/50" />
                   </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditUserModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleEditUser} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      </>

      {/* Table Section Redesigned */}
      <div className="bg-admin-surface-container-high/40 backdrop-blur-xl border border-admin-outline-variant/20 rounded-[2rem] overflow-hidden shadow-xl mt-8">
        <div className="p-6 border-b border-admin-outline-variant/10 flex justify-between items-center bg-admin-surface-container-highest/20">
          <div>
            <h3 className="text-xl font-bold text-admin-on-surface tracking-tight">Active Roster</h3>
            <p className="text-xs text-admin-on-surface-variant mt-1">Manage platform access and privileges</p>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-admin-surface-container-high/50 border-b border-admin-outline-variant/10">
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-admin-on-surface-variant">User Entity</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-admin-on-surface-variant">Role Tier</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-admin-on-surface-variant">Institute</th>
              <th className="px-8 py-5 text-[10px] uppercase tracking-[0.1em] font-black text-admin-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-outline-variant/10">
            {filteredUsers.map(u => (
              <tr key={u._id} className="hover:bg-admin-surface-container-highest/60 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-admin-primary/20 flex items-center justify-center border border-admin-primary/20 overflow-hidden text-admin-primary font-bold shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-admin-on-surface flex items-center gap-2">
                        {u.name}
                        {u.isBanned && <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-admin-error/20 text-admin-error tracking-wider uppercase">Banned</span>}
                      </p>
                      <p className="text-xs text-admin-on-surface-variant">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <select
                    value={u.role}
                    disabled={isRoleLocked(u.role)}
                    onChange={e => handleRoleChange(u._id, e.target.value)}
                    className={`px-3 py-1.5 bg-admin-surface-container-lowest/50 border border-admin-outline-variant/20 rounded-lg text-xs font-semibold text-admin-primary outline-none focus:border-admin-primary/50 ${isRoleLocked(u.role) ? 'opacity-70 cursor-not-allowed text-admin-on-surface-variant' : 'cursor-pointer'}`}
                  >
                    {getRoleOptions(u.role).map(r => (
                      <option key={r} value={r} className="bg-admin-surface-container-highest">{formatRoleLabel(r)}</option>
                    ))}
                  </select>
                  {isRoleLocked(u.role) && (
                    <p className="text-[10px] text-amber-500/80 mt-1 font-bold tracking-wider">LOCKED</p>
                  )}
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-admin-secondary/10 text-admin-secondary border border-admin-secondary/20 truncate max-w-[150px] inline-block">
                    {u.instituteId?.name || '— Independent —'}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleBan(u._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.isBanned ? 'bg-admin-secondary/10 text-admin-secondary hover:bg-admin-secondary/20' : 'bg-admin-error/10 text-admin-error hover:bg-admin-error/20'}`}>
                      {u.isBanned ? 'Restore' : 'Ban'}
                    </button>
                    <button onClick={() => setEditUserModal(u)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-admin-primary/10 text-admin-primary hover:bg-admin-primary/20 transition-colors">
                      Edit
                    </button>
                    {['teacher', 'hod'].includes(u.role) && (
                      <button onClick={() => { setSelectedTeacherForFeedback(u); setIsFeedbackModalOpen(true); }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-admin-tertiary/10 text-admin-tertiary hover:bg-admin-tertiary/20 transition-colors" title="View Feedback">
                        Feedback
                      </button>
                    )}
                    <button onClick={() => openDeleteModal(u._id, u.email, 'User', 'All their data, XP, submissions, and history will be permanently deleted.', 'user')}
                      className="p-1.5 rounded-lg bg-admin-error/10 text-admin-error hover:bg-admin-error/20 transition-colors" title="Delete user">
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={4} className="text-center py-16 text-admin-on-surface-variant">No users found in this query...</td></tr>
            )}
          </tbody>
        </table>
        </div>
        <div className="bg-admin-surface-container-high/30">
        <Pagination pagination={userPagination} current={userPage} onPageChange={p => { setUserPage(p); fetchUsers(null, p, userSearch); }} />
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
