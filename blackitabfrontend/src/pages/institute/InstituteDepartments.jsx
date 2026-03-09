import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BookOpenIcon, PlusIcon, XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
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

            // Also fetch stats
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
                ...institute, // pass existing values
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
            <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans">
                <BuildingOfficeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Institute Not Found</h2>
                <p className="text-gray-500 text-sm mt-2">You don't seem to be linked to an active institute.</p>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] text-gray-900 dark:text-white p-4 py-8 relative font-sans">
            <div className="max-w-4xl mx-auto relative z-10 space-y-8">
                
                {/* Headers */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 flex items-center gap-3">
                        <BookOpenIcon className="w-8 h-8 text-orange-500" />
                        Departments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage the departments available in your institute</p>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-xl relative">
                    
                    {/* Add Department Input */}
                    {isEditable && (
                        <div className="mb-8 pb-8 border-b border-gray-100 dark:border-white/5 space-y-4">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Add New Department</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newDept}
                                    onChange={(e) => setNewDept(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDepartment())}
                                    placeholder="E.g. Computer Science and Engineering"
                                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all shadow-sm"
                                    disabled={saving}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDepartment}
                                    disabled={saving || !newDept.trim()}
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold px-6 md:px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Adding...' : <><PlusIcon className="w-5 h-5" /> Add</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Departments List */}
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                            Current Departments ({departments.length})
                        </h3>
                        
                        {departments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {departments.map((dept, index) => (
                                    <div 
                                        key={index}
                                        className="flex flex-col justify-center group bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 p-5 rounded-2xl hover:bg-orange-100/50 dark:hover:bg-orange-500/10 transition-colors shadow-sm relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="font-semibold text-lg text-orange-900 dark:text-orange-100 pr-8 leading-tight">
                                                {dept}
                                            </span>
                                            {isEditable && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveDepartment(dept)}
                                                    disabled={saving}
                                                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-500/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0 shadow-sm"
                                                    title={`Remove ${dept}`}
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mt-auto">
                                            <div className="bg-white/80 dark:bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-200/50 dark:border-orange-500/20 inline-flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    <span className="font-bold text-gray-900 dark:text-white mr-1">{deptStats[dept] || 0}</span> 
                                                    Student{deptStats[dept] !== 1 ? 's' : ''} Enrolled
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
                                <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">No departments have been added yet.</p>
                                {isEditable && <p className="text-sm text-gray-400 italic mt-1">Use the input above to add your first department.</p>}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InstituteDepartments;
