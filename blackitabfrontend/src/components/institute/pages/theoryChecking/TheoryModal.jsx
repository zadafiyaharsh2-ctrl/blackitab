import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TheoryModal = ({
  isModalOpen,
  setIsModalOpen,
  editingTheory,
  handleSubmit,
  formData,
  setFormData,
  institute
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 shrink-0">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTheory ? 'Edit Material' : 'Upload Material'}</h3>
          <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="theoryForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <input
                type="text" required
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="E.g. Chapter 1: Introduction to Mechanics"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                <input
                  type="text" required
                  value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <select
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">All Departments</option>
                  {institute?.departments?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File URL (Google Drive, PDF link, etc.)</label>
              <input
                type="url"
                value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / Short Content (Optional)</label>
              <textarea
                rows={4}
                value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-y"
                placeholder="Add any notes or short text content here..."
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-200/50 dark:border-white/10 shrink-0 flex gap-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md rounded-b-2xl">
          <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-800 dark:text-white font-semibold transition-colors">Cancel</button>
          <button type="submit" form="theoryForm" className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#063669] to-[#274e82] hover:opacity-90 text-white font-bold tracking-wide transition-all shadow-md">
            {editingTheory ? 'Save Changes' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheoryModal;
