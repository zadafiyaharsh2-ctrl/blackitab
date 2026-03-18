import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AddTeacherModal = ({ isOpen, onClose, onSubmit, formData, setFormData, inputCls }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add New Teacher</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input type="password" required minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputCls}>
              <option value="teacher">Teacher</option>
              <option value="hod">HOD</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
            <button type="submit" className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">Add Teacher</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;
