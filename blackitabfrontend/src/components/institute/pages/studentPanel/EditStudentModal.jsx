import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditStudentModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  editingStudent,
  handleEditSubmit,
  formData,
  setFormData,
  institute,
  saving,
  inputCls
}) => {
  if (!isEditModalOpen || !editingStudent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h2 className="font-semibold text-gray-900 dark:text-white">Edit Student</h2>
          <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
            <p className="font-semibold text-sm text-gray-900 dark:text-white">{editingStudent.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{editingStudent.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Batch Year</label>
            <select value={formData.batchYear} onChange={e => setFormData({...formData, batchYear: e.target.value})} className={inputCls}>
              <option value="">Select Year</option>
              {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={inputCls}>
              <option value="">Select Department</option>
              {institute?.departments?.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
