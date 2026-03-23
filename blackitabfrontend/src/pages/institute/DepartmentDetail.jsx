import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import { 
    UserGroupIcon, 
    AcademicCapIcon, 
    ArrowLeftIcon, 
    BuildingOfficeIcon,
    BriefcaseIcon,
    UsersIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline';
import InstituteBreadcrumb from '../../components/institute/InstituteBreadcrumb';

const DepartmentDetail = () => {
    const { deptName } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        hod: null,
        coreTeachers: [],
        visitingTeachers: [],
        batches: []
    });

    useEffect(() => {
        fetchDepartmentDetails();
    }, [deptName]);

    const fetchDepartmentDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/institute/departments/${encodeURIComponent(deptName)}/details`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to fetch department details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageShimmer variant="cards" />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Breadcrumb */}
            <InstituteBreadcrumb items={[
                { label: 'Departments', to: '/institute/departments' },
                { label: deptName }
            ]} />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                        {deptName} Department
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">Faculty, batches, and student overview</p>
                </div>
                <Link
                    to="/hod/attendance"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all"
                >
                    <CalendarDaysIcon className="w-4 h-4" />
                    View Attendance
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: HOD & Core Teachers */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* HOD Section */}
                    <div className="border border-indigo-200 dark:border-indigo-500/30 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/5 p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BriefcaseIcon className="w-24 h-24 text-indigo-500" />
                        </div>
                        <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BriefcaseIcon className="w-4 h-4" />
                            Head of Department
                        </h2>
                        
                        {data.hod ? (
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border-2 border-indigo-200 dark:border-indigo-500/30">
                                    {data.hod.profileImage ? (
                                        <img src={data.hod.profileImage} alt={data.hod.name} className="w-full h-full object-cover" />
                                    ) : (
                                        data.hod.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{data.hod.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{data.hod.email}</p>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium mt-2">
                                        HOD
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No HOD assigned to this department yet.</p>
                        )}
                    </div>

                    {/* Core Core Teachers */}
                    <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                                Core Faculty
                            </h2>
                            <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                {data.coreTeachers.length}
                            </span>
                        </div>
                        
                        <div className="p-5">
                            {data.coreTeachers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.coreTeachers.map(teacher => (
                                        <Link key={teacher._id} to={`/institute/teacher/${teacher._id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:border-blue-500/30 transition-all cursor-pointer group">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                                {teacher.profileImage ? (
                                                    <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    teacher.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{teacher.name}</p>
                                                <p className="text-xs text-gray-500 max-w-[140px] truncate" title={teacher.email}>{teacher.email}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">
                                    No core faculty listed for this department.
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Visiting Teachers */}
                    {data.visitingTeachers.length > 0 && (
                        <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
                            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 text-gray-400" />
                                    Visiting / Cross-Department Faculty
                                </h2>
                                <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                    {data.visitingTeachers.length}
                                </span>
                            </div>
                            
                            <div className="p-5">
                                <p className="text-xs text-gray-500 mb-4">These teachers belong to other departments but are teaching batches within {deptName}.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.visitingTeachers.map(teacher => (
                                        <Link key={teacher._id} to={`/institute/teacher/${teacher._id}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] hover:border-blue-500/30 transition-all cursor-pointer group">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                                {teacher.profileImage ? (
                                                    <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    teacher.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{teacher.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Primary: {teacher.departments?.join(', ') || 'None'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Batches */}
                <div className="space-y-6">
                    <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] sticky top-6">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <UserGroupIcon className="w-4 h-4 text-gray-400" />
                                Related Batches
                            </h2>
                            <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                {data.batches.length}
                            </span>
                        </div>
                        
                        <div className="p-5">
                            {data.batches.length > 0 ? (
                                <div className="space-y-3">
                                    {data.batches.map(batch => (
                                        <Link key={batch._id} to={`/teacher/batch/${batch._id}`} className="block p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-blue-500/30 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{batch.name}</h3>
                                                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                                    {batch.year} {batch.section}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <AcademicCapIcon className="w-3.5 h-3.5" />
                                                    Taught by: <span className="font-medium text-gray-700 dark:text-gray-300">{batch.teachers?.length > 0 ? batch.teachers.map(t => t.name).join(', ') : 'Unknown'}</span>
                                                </div>
                                                <Link
                                                    to={`/institute/batch/${batch._id}/timetable`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded transition-colors"
                                                >
                                                    <CalendarDaysIcon className="w-3 h-3" /> Timetable
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-lg">
                                    <p className="text-sm text-gray-500">No batches linked to this department.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DepartmentDetail;
