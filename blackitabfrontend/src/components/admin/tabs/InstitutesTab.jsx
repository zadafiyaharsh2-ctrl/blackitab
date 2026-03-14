import React from 'react';
import { FaPlus, FaTimes, FaChevronLeft, FaUsers, FaTrash, FaSchool } from 'react-icons/fa';

const InstitutesTab = ({
  institutes, showCreateInstitute, setShowCreateInstitute, newInstitute, setNewInstitute, handleCreateInstitute,
  selectedInstitute, setSelectedInstitute, instituteMembers, instituteMembersLoading,
  editInstituteModal, setEditInstituteModal, editInstituteTab, setEditInstituteTab, handleEditInstitute,
  openDeleteModal, fetchInstituteMembers
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Registered Institutes ({institutes.length})</h2>
        <button onClick={() => setShowCreateInstitute(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
          <FaPlus /> Add Institute
        </button>
      </div>

      {/* Create Institute Modal */}
      {showCreateInstitute && (
        <div className="glass-panel p-6 border border-white/10 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">New Institute</h3>
            <button onClick={() => setShowCreateInstitute(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input value={newInstitute.name} onChange={e => setNewInstitute({ ...newInstitute, name: e.target.value })}
              placeholder="Institute Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none" />
            <input value={newInstitute.instituteCode} onChange={e => setNewInstitute({ ...newInstitute, instituteCode: e.target.value.toUpperCase() })}
              placeholder="Code (e.g. PICT2024)" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 outline-none uppercase" />
            <select value={newInstitute.subscriptionPlan} onChange={e => setNewInstitute({ ...newInstitute, subscriptionPlan: e.target.value })}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 outline-none">
              <option value="free" className="bg-gray-900">Free</option>
              <option value="basic" className="bg-gray-900">Basic</option>
              <option value="premium" className="bg-gray-900">Premium</option>
              <option value="enterprise" className="bg-gray-900">Enterprise</option>
            </select>
          </div>
          <button onClick={handleCreateInstitute}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors">
            Create Institute
          </button>
        </div>
      )}

      {selectedInstitute ? (
        <div className="glass-panel p-6 border border-white/10 rounded-2xl relative">
            <button onClick={() => setSelectedInstitute(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <FaChevronLeft /> Back to List
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {selectedInstitute.name[0]}
              </div>
              <div>
                  <h3 className="text-2xl font-black text-white leading-tight">{selectedInstitute.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-emerald-400 font-mono text-sm uppercase px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">{selectedInstitute.instituteCode}</span>
                    <span className="text-gray-400 text-sm capitalize px-2 py-0.5 bg-white/5 rounded border border-white/10">{selectedInstitute.subscriptionPlan} Plan</span>
                  </div>
              </div>
            </div>

            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><FaUsers className="text-emerald-400" /> Institute Roster ({instituteMembers.length})</h4>
            
            {instituteMembersLoading ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div></div>
            ) : instituteMembers.length === 0 ? (
              <div className="text-center py-10 bg-white/5 rounded-xl border border-white/10 text-gray-500">No members found in this institute.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {instituteMembers.map(m => (
                    <div key={m._id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                              <p className="text-sm font-bold text-white leading-tight break-words">{m.name}</p>
                              <p className="text-[10px] text-gray-500 truncate">{m.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide shrink-0 ${
                              m.role === 'institute' ? 'bg-orange-500/20 text-orange-400' :
                              m.role === 'hod' ? 'bg-purple-500/20 text-purple-400' :
                              m.role === 'teacher' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-blue-500/20 text-blue-400'
                          }`}>{m.role}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-white/5 mt-auto">
                          <span title="Points / XP">⭐ {m.points || 0} / ⚡ {m.xp || 0}</span>
                          <span>Streak: {m.streak || 0}🔥</span>
                        </div>
                    </div>
                  ))}
              </div>
            )}
        </div>
      ) : (
        <>
          {/* Comprehensive Edit Institute Modal */}
          <>
          {editInstituteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                  {editInstituteModal.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">Edit Institute: {editInstituteModal.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{editInstituteModal.instituteCode}</p>
                </div>
              </div>
              <button onClick={() => setEditInstituteModal(null)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><FaTimes /></button>
            </div>

            {/* Tabs */}
            <div className="flex px-5 border-b border-white/5 bg-white/[0.01]">
              {['general', 'details', 'metadata'].map(tab => (
                <button key={tab} onClick={() => setEditInstituteTab(tab)}
                  className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 ${editInstituteTab === tab ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              
              {editInstituteTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Institute Name</label>
                      <input value={editInstituteModal.name || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Institute Code</label>
                      <input value={editInstituteModal.instituteCode || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, instituteCode: e.target.value.toUpperCase() })} 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none uppercase font-mono focus:border-emerald-500/50" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subscription Plan</label>
                        <select value={editInstituteModal.subscriptionPlan || 'free'} onChange={e => setEditInstituteModal({ ...editInstituteModal, subscriptionPlan: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50 capitalize">
                          <option value="free" className="bg-gray-900">Free</option>
                          <option value="basic" className="bg-gray-900">Basic</option>
                          <option value="premium" className="bg-gray-900">Premium</option>
                          <option value="enterprise" className="bg-gray-900">Enterprise</option>
                        </select>
                    </div>
                  </div>
                </div>
              )}

              {editInstituteTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
                    <textarea value={editInstituteModal.description || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, description: e.target.value })}
                      rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none resize-none focus:border-emerald-500/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Phone</label>
                      <input value={editInstituteModal.contactPhone || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, contactPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Banner Image URL</label>
                      <input value={editInstituteModal.bannerImage || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, bannerImage: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Address</label>
                    <input value={editInstituteModal.address || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, address: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                  </div>
                </div>
              )}

              {editInstituteTab === 'metadata' && (
                <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Departments (Comma separated)</label>
                      <input value={editInstituteModal.departments || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, departments: e.target.value })}
                        placeholder="e.g. Computer Science, Mechanical, IT"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                      <p className="text-[10px] text-gray-500 mt-1">These will be split into an array upon saving.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Admin Emails (Comma separated)</label>
                      <input value={editInstituteModal.adminEmails || ''} onChange={e => setEditInstituteModal({ ...editInstituteModal, adminEmails: e.target.value })}
                        placeholder="e.g. admin1@school.edu, principal@school.edu"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-emerald-500/50" />
                      <p className="text-[10px] text-gray-500 mt-1">Super Admin level access for these emails.</p>
                    </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setEditInstituteModal(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleEditInstitute} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      </>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutes.map(inst => (
              <div key={inst._id} onClick={() => { setSelectedInstitute(inst); fetchInstituteMembers(inst._id); }} className="glass-panel p-6 border border-white/10 rounded-2xl group relative cursor-pointer hover:border-emerald-500/30 transition-colors">
              <button onClick={(e) => { e.stopPropagation(); openDeleteModal(inst._id, inst.name, 'Institute', 'All associated teachers, students, and classes will be unlinked.', 'institute'); }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 z-10">
                <FaTrash className="text-xs" />
              </button>
              <button onClick={(e) => { 
                  e.stopPropagation(); 
                  setEditInstituteModal({
                      ...inst, 
                      departments: inst.departments?.join(', ') || '', 
                      adminEmails: inst.adminEmails?.join(', ') || ''
                  }); 
              }}
                className="absolute top-3 right-10 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500/20 z-10">
                Edit
              </button>
              <h3 className="text-white font-bold mb-1 pr-16">{inst.name}</h3>
              <p className="text-orange-400 text-xs font-mono mb-3">{inst.instituteCode}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400"><FaUsers className="inline mr-1" /> {inst.memberCount || 0} members</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  inst.subscriptionPlan === 'premium' ? 'bg-yellow-500/10 text-yellow-400' :
                  inst.subscriptionPlan === 'enterprise' ? 'bg-purple-500/10 text-purple-400' :
                  inst.subscriptionPlan === 'basic' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>{inst.subscriptionPlan}</span>
              </div>
            </div>
          ))}
          {institutes.length === 0 && (
            <div className="col-span-full text-center py-16 text-gray-500">
              <FaSchool className="text-4xl mx-auto mb-3 opacity-30" />
              <p>No institutes registered</p>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default InstitutesTab;
