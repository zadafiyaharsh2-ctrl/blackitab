import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpenIcon, PlusIcon, XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { CustomToast } from '../../utils/CustomToast';

const InstituteDepartments = () => {
    const userDataStr = localStorage.getItem('user');
    const user = userDataStr ? JSON.parse(userDataStr) : null;
    const [institute, setInstitute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [deptStats, setDeptStats] = useState({});
    const [newDept, setNewDept] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/institute/my');
            if (res.data.success) {
                const inst = res.data.data;
                setInstitute(inst);
                setDepartments(inst.departments || []);
            }
            const statsRes = await api.get('/institute/departments/stats');
            if (statsRes.data.success) {
                setDeptStats(statsRes.data.data);
            }
        } catch (error) {
            CustomToast.error('Failed to load institute departments');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async () => {
        if (!newDept.trim()) return;
        if (departments.includes(newDept.trim())) {
            CustomToast.error('Department already exists');
            return;
        }
        const updatedDeps = [...departments, newDept.trim()];
        await saveDepartments(updatedDeps);
    };

    const handleRemoveDepartment = async (deptToRemove) => {
        const updatedDeps = departments.filter(d => d !== deptToRemove);
        await saveDepartments(updatedDeps);
    };

    const saveDepartments = async (updatedDeps) => {
        if (!institute) return;
        try {
            setSaving(true);
            const res = await api.put('/institute/profile', {
                ...institute,
                departments: updatedDeps
            });
            if (res.data.success) {
                setDepartments(updatedDeps);
                setInstitute({ ...institute, departments: updatedDeps });
                CustomToast.success('Departments updated successfully');
                setNewDept('');
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to update departments');
        } finally {
            setSaving(false);
        }
    };

    const isEditable = user?.role === 'institute';

    if (loading) return <LoadingSpinner />;

    if (!institute) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <BuildingOfficeIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Institute Not Found</h2>
                <p className="text-gray-500 text-sm mt-1">You don't seem to be linked to an active institute.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpenIcon className="w-5 h-5 text-gray-400" />
                    Departments
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage the departments available in your institute</p>
            </div>

            <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">

                {/* Add Department */}
                {isEditable && (
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Add New Department</p>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newDept}
                                onChange={(e) => setNewDept(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
                                placeholder="E.g. Computer Science and Engineering"
                                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                disabled={saving}
                            />
                            <button
                                type="button"
                                onClick={handleAddDepartment}
                                disabled={saving || !newDept.trim()}
                                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {saving ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Departments List */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Current Departments
                        </h3>
                        <span className="text-xs text-gray-400">{departments.length} total</span>
                    </div>

                    {departments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {departments.map((dept, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.04] relative group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-sm text-gray-900 dark:text-white leading-snug">
                                            {dept}
                                        </p>
                                        {isEditable && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveDepartment(dept)}
                                                disabled={saving}
                                                className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                                                title={`Remove ${dept}`}
                                            >
                                                <XMarkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{deptStats[dept] || 0}</span> student{deptStats[dept] !== 1 ? 's' : ''} enrolled
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                            <BookOpenIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No departments have been added yet.</p>
                            {isEditable && <p className="text-xs text-gray-400 mt-1">Use the input above to add your first department.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstituteDepartments;
