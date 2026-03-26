import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import InstituteBreadcrumb from '../../components/institute/InstituteBreadcrumb';
import { CustomToast } from '../../utils/CustomToast';
import { 
    ArrowLeftIcon, 
    UserIcon,
    AcademicCapIcon,
    ChartBarIcon,
    UserGroupIcon,
    BookOpenIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UsersIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

import TeacherBatchesTab from '../../components/institute/pages/teacherProfile/TeacherBatchesTab';
import TeacherMaterialsTab from '../../components/institute/pages/teacherProfile/TeacherMaterialsTab';
import TeacherAssignmentsTab from '../../components/institute/pages/teacherProfile/TeacherAssignmentsTab';

const TeacherProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({
        teacher: null,
        batches: [],
        materials: [],
        assignments: [],
        stats: { questionsCreated: 0, totalBatches: 0, totalMaterials: 0, totalAssignments: 0 }
    });

    // Expandable batch states
    const [expandedBatch, setExpandedBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState({});
    const [loadingStudents, setLoadingStudents] = useState(null);



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

    const toggleBatchExpand = async (batchId) => {
        if (expandedBatch === batchId) {
            setExpandedBatch(null);
            return;
        }
        setExpandedBatch(batchId);

        if (!batchStudents[batchId]) {
            try {
                setLoadingStudents(batchId);
                const token = localStorage.getItem('token');
                const res = await api.get(`/teacher/batch/${batchId}`);
                if (res.data.success) {
                    setBatchStudents(prev => ({
                        ...prev,
                        [batchId]: res.data.data.studentIds || []
                    }));
                }
            } catch (err) {
                console.error('Failed to load students for batch', err);
                setBatchStudents(prev => ({ ...prev, [batchId]: [] }));
            } finally {
                setLoadingStudents(null);
            }
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

    const tabs = [
        { key: 'overview', label: 'Overview', icon: ChartBarIcon },
        { key: 'batches', label: `Batches (${batches.length})`, icon: UserGroupIcon },
        { key: 'materials', label: `Materials (${data.materials?.length || 0})`, icon: DocumentTextIcon },
        { key: 'assignments', label: `Assignments (${data.assignments?.length || 0})`, icon: ClipboardDocumentCheckIcon }
    ];

    const primaryDept = teacher.departments?.[0] || null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            
            {/* Breadcrumb */}
            <InstituteBreadcrumb items={[
                { label: 'Departments', to: '/institute/departments' },
                ...(primaryDept ? [{ label: primaryDept, to: `/institute/department/${encodeURIComponent(primaryDept)}` }] : []),
                { label: teacher.name }
            ]} />

            {/* Profile Banner */}
            <div className="border border-blue-200 dark:border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-50 dark:from-blue-900/10 to-indigo-50 dark:to-indigo-900/10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-3xl overflow-hidden shrink-0 border-4 border-white dark:border-gray-800 shadow-sm z-10">
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
                                <Link key={d} to={`/institute/department/${encodeURIComponent(d)}`}
                                    className="px-2.5 py-1 bg-white/60 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 transition-colors">
                                    {d}
                                </Link>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">No departments configured</span>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4 sm:gap-6 mt-4 md:mt-0 z-10 border-t md:border-t-0 md:border-l border-gray-200/50 dark:border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Batches</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBatches}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Uploads</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(stats.totalMaterials || 0) + (stats.totalAssignments || 0)}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${
                            activeTab === tab.key
                                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ Overview Tab ═══ */}
            {activeTab === 'overview' && (
                <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Role</span>
                            <span className="font-semibold text-gray-900 dark:text-white capitalize">{teacher.role}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Email</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{teacher.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Departments</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{teacher.departments?.join(', ') || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Total Batches</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{stats.totalBatches}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Questions Created</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{stats.questionsCreated}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                            <span className="text-gray-500">Joined</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Batches Tab ═══ */}
            {activeTab === 'batches' && (
                <TeacherBatchesTab
                  batches={batches}
                  expandedBatch={expandedBatch}
                  toggleBatchExpand={toggleBatchExpand}
                  batchStudents={batchStudents}
                  loadingStudents={loadingStudents}
                />
            )}

            {/* ═══ Materials Tab ═══ */}
            {activeTab === 'materials' && (
                <TeacherMaterialsTab materials={data.materials} />
            )}

            {/* ═══ Assignments Tab ═══ */}
            {activeTab === 'assignments' && (
                <TeacherAssignmentsTab assignments={data.assignments} />
            )}
        </div>
    );
};

export default TeacherProfileView;
