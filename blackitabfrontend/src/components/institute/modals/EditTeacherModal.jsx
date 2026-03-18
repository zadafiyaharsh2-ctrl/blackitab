import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const EditTeacherModal = ({ isOpen, onClose, onSubmit, editTeacher, setEditTeacher, institute, toggleDepartment, inputCls }) => {
  if (!isOpen || !editTeacher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">Edit Teacher</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          <form id="editTeacherForm" onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={editTeacher.role}
                onChange={e => setEditTeacher({...editTeacher, role: e.target.value})}
                className={inputCls}
              >
                <option value="teacher">Teacher</option>
                <option value="hod">HOD</option>
              </select>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Departments</label>
              <div className="space-y-2">
                {institute?.departments?.length > 0 ? (
                  institute.departments.map(dept => (
                    <label key={dept} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                        checked={(editTeacher.departments || []).includes(dept)}
                        onChange={() => toggleDepartment(dept)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{dept}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No departments created in Institute Profile yet.</p>
                )}
              </div>
            </div>
          </form>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-400">Cancel</button>
          <button type="submit" form="editTeacherForm" className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;
