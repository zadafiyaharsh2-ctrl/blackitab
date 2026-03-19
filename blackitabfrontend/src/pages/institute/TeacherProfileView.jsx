import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import { 
    ArrowLeftIcon, 
    UserIcon,
    AcademicCapIcon,
    ChartBarIcon,
    UserGroupIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';

const TeacherProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        teacher: null,
        batches: [],
        stats: { questionsCreated: 0, totalBatches: 0 }
    });

    useEffect(() => {
        fetchTeacherDetails();
    }, [id]);

    const fetchTeacherDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/institute/teacher/${id}/details`);
            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to fetch teacher details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageShimmer variant="cards" />;

    if (!data.teacher) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <UserIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Teacher Not Found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline">Go Back</button>
            </div>
        );
    }

    const { teacher, batches, stats } = data;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            
            {/* Nav Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" />
                    Teacher Profile
                </div>
            </div>

            {/* Profile Banner */}
            <div className="border border-blue-200 dark:border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-900/10 to-indigo-50 dark:to-indigo-900/10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 border-4 border-white dark:border-gray-800 shadow-sm z-10">
                    {teacher.profileImage ? (
                        <img src={teacher.profileImage} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                        teacher.name.charAt(0).toUpperCase()
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left z-10">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-3">
                        {teacher.name}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                        teacher.role === 'hod'
                          ? 'border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300'
                          : 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}>
                            {teacher.role === 'hod' ? 'HOD' : 'Teacher'}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{teacher.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                        {teacher.departments?.length > 0 ? (
                            teacher.departments.map(d => (
                                <span key={d} className="px-2.5 py-1 bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 backdrop-blur-sm">
                                    {d}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">No departments configured</span>
                        )}
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="flex gap-4 sm:gap-6 mt-4 md:mt-0 z-10 border-t md:border-t-0 md:border-l border-gray-200/50 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Batches</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBatches}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Questions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.questionsCreated}</p>
                    </div>
                </div>
            </div>

            {/* Managed Batches Section */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
                <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-gray-400" />
                        Managed Classrooms / Batches
                    </h2>
                    <span className="text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {batches.length} Classes
                    </span>
                </div>

                <div className="p-5">
                    {batches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {batches.map(batch => (
                                <Link
                                    to={`/teacher/batch/${batch._id}`}
                                    key={batch._id}
                                    className="p-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all bg-gray-50/50 dark:bg-white/[0.02] block group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {batch.name}
                                        </h3>
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                            {batch.year} {batch.section}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg p-2.5 flex items-center gap-2">
                                            <UsersIcon className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-semibold leading-none">Students</p>
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight mt-0.5">{batch.studentCount}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg p-2.5 flex items-center gap-2">
                                            <BookOpenIcon className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-semibold leading-none">Subject</p>
                                                <p className="font-bold text-gray-900 dark:text-white leading-tight mt-0.5">
                                                    {batch.subjectId?.name || 'Assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                            <AcademicCapIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">This teacher is not managing any batches yet.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default TeacherProfileView;
