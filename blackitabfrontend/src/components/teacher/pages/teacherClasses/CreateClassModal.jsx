import React from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

const CreateClassModal = ({ showCreateModal, setShowCreateModal, formData, setFormData, instituteDepartments, handleCreateBatch }) => {
  if (!showCreateModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-white/10">
        
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.01]">
          <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">Initialize Cohort</h3>
          <button 
            onClick={() => setShowCreateModal(false)} 
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center text-gray-500 transition-colors focus:outline-none"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
        
        <form onSubmit={handleCreateBatch} className="p-8 space-y-6">
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Class Name <span className="text-[#0061FF]">*</span>
            </label>
            <input
              type="text" required
              placeholder="e.g. Adv. Physics 101"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
              className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Academic Year <span className="text-[#0061FF]">*</span>
              </label>
              <input
                type="text" required
                placeholder="e.g. 2024"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
              />
            </div>
            <div>
               <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Section
              </label>
              <input
                type="text"
                placeholder="e.g. A"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Department Jurisdiction <span className="text-[#0061FF]">*</span>
            </label>
            <div className="relative">
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#0061FF] focus:bg-white dark:focus:bg-[#0a0a0a] transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Department</option>
                {instituteDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
            {instituteDepartments.length === 0 && (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide mt-2">
                No departments available. Contact Institute Admin.
              </p>
            )}
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
            <button 
              type="button" 
              onClick={() => setShowCreateModal(false)} 
              className="flex-1 py-3.5 bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={instituteDepartments.length === 0}
              className="flex-1 py-3.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:bg-[#0061FF] dark:hover:bg-[#0061FF] dark:hover:text-white rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md focus:outline-none"
            >
              Create Cohort
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassModal;
