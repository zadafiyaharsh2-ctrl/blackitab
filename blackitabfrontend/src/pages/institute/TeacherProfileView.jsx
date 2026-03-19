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
    CalendarDaysIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    UsersIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const TeacherProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({
        teacher: null,
        batches: [],
        stats: { questionsCreated: 0, totalBatches: 0 }
    });

    // Expandable batch states
    const [expandedBatch, setExpandedBatch] = useState(null);
    const [batchStudents, setBatchStudents] = useState({});
    const [loadingStudents, setLoadingStudents] = useState(null);

    // Attendance states
    const [selectedAttBatch, setSelectedAttBatch] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [studentAnalytics, setStudentAnalytics] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);

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

    const fetchAttendance = async (batchId) => {
        setSelectedAttBatch(batchId);
        setLoadingAttendance(true);
        setAttendanceData([]);
        setStudentAnalytics([]);
        try {
            const [historyRes, analyticsRes, batchRes] = await Promise.all([
                api.get(`/teacher/attendance/${batchId}`).catch(() => ({ data: { success: true, data: [] } })),
                api.get(`/teacher/attendance/${batchId}/analytics`).catch(() => ({ data: { success: true, data: [] } })),
                api.get(`/teacher/batch/${batchId}`).catch(() => ({ data: { success: true, data: { studentIds: [] } } }))
            ]);

            if (historyRes.data.success) setAttendanceData(historyRes.data.data || []);
            
            const students = batchRes.data?.success ? (batchRes.data?.data?.studentIds || []) : [];
            const analytics = analyticsRes.data?.success ? (analyticsRes.data?.data || []) : [];

            const keyOf = (val) => {
                if (!val) return '';
                if (typeof val === 'string') return val;
                return val._id || val.toString?.() || '';
            };
            const analyticsMap = new Map(analytics.map(item => [keyOf(item.studentId || item._id), item]));

            const merged = students.map((student, index) => {
                const sid = keyOf(student?._id || student);
                const stat = analyticsMap.get(sid);
                return {
                    _id: sid || index,
                    studentName: student?.name || stat?.studentName || 'Unknown',
                    studentEmail: student?.email || stat?.studentEmail || '',
                    presentCount: stat?.presentCount || 0,
                    absentCount: stat?.absentCount || 0,
                    lateCount: stat?.lateCount || 0,
                    totalClasses: stat?.totalClasses || 0,
                    attendancePercentage: typeof stat?.attendancePercentage === 'number' ? stat.attendancePercentage : 0
                };
            });
            setStudentAnalytics(merged.length > 0 ? merged : analytics);
        } catch (err) {
            console.error('Failed to load attendance', err);
        } finally {
            setLoadingAttendance(false);
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
        { key: 'attendance', label: 'Attendance', icon: CalendarDaysIcon },
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
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Questions</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.questionsCreated}</p>
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
                <div className="space-y-4">
                    {batches.length > 0 ? (
                        batches.map(batch => {
                            const isExpanded = expandedBatch === batch._id;
                            const students = batchStudents[batch._id] || [];
                            const isLoadingThis = loadingStudents === batch._id;

                            return (
                                <div key={batch._id} className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] overflow-hidden transition-all">
                                    {/* Batch Header — clickable to expand */}
                                    <button
                                        onClick={() => toggleBatchExpand(batch._id)}
                                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center">
                                                <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-base">{batch.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                                        {batch.year} {batch.section}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <UsersIcon className="w-3.5 h-3.5" />
                                                        {batch.studentCount} students
                                                    </span>
                                                    {batch.subjectId?.name && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            <BookOpenIcon className="w-3.5 h-3.5" />
                                                            {batch.subjectId.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isExpanded
                                            ? <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                            : <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                        }
                                    </button>

                                    {/* Expanded: Student Roster */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                                            {isLoadingThis ? (
                                                <div className="flex items-center justify-center py-8 gap-3">
                                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-sm text-gray-500">Loading students...</span>
                                                </div>
                                            ) : students.length > 0 ? (
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-3 px-1">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled Students</p>
                                                        <span className="text-xs text-gray-400">{students.length} total</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {students.map(student => (
                                                            <Link
                                                                key={student._id}
                                                                to={`/institute/student/${student._id}`}
                                                                className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500/30 transition-all group"
                                                            >
                                                                <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 text-sm font-bold shrink-0">
                                                                    {student.name?.charAt(0).toUpperCase() || 'S'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                        {student.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-sm text-gray-500">
                                                    No students enrolled in this batch.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                            <AcademicCapIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">This teacher is not managing any batches yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Attendance Tab ═══ */}
            {activeTab === 'attendance' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Batch Selector */}
                    <div className="border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] p-4 md:col-span-1 max-h-[70vh] overflow-y-auto">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Select a Batch</h3>
                        {batches.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No batches assigned</p>
                        ) : batches.map(batch => (
                            <button
                                key={batch._id}
                                onClick={() => fetchAttendance(batch._id)}
                                className={`w-full text-left p-4 rounded-xl mb-2 border transition-all ${
                                    selectedAttBatch === batch._id
                                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30'
                                        : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                            >
                                <div className="font-bold text-sm text-gray-900 dark:text-white">{batch.name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                    <UsersIcon className="w-3.5 h-3.5" /> {batch.studentCount} students
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Attendance Data */}
                    <div className="md:col-span-2 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] p-6">
                        {!selectedAttBatch ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <CalendarDaysIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="font-medium">Select a batch to view attendance</p>
                            </div>
                        ) : loadingAttendance ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Student Analytics */}
                                {studentAnalytics.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Student Attendance Overview</h4>
                                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                            {studentAnalytics.map((s, idx) => {
                                                const pct = Math.round(s.attendancePercentage || 0);
                                                return (
                                                    <div key={s._id || idx} className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.studentName}</p>
                                                                <p className="text-xs text-gray-500">{s.studentEmail}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-sm font-bold ${pct >= 75 ? 'text-green-600 dark:text-green-400' : pct >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{pct}%</p>
                                                                <p className="text-xs text-gray-500">P {s.presentCount} | A {s.absentCount} | L {s.lateCount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                                                            <div className={`h-1.5 rounded-full transition-all ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Attendance Records */}
                                {attendanceData.length > 0 ? (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Session Records</h4>
                                        {attendanceData.map((record, i) => {
                                            const presentCount = record.records?.filter(r => r.status === 'Present').length || 0;
                                            const totalCount = record.records?.length || 0;
                                            return (
                                                <div key={record._id || i} className="p-4 mb-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                                {record.date ? new Date(record.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-500">
                                                            {presentCount}/{totalCount} present
                                                        </span>
                                                    </div>
                                                    {totalCount > 0 && (
                                                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                                                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(presentCount / totalCount * 100)}%` }} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                        <CalendarDaysIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No attendance records found for this batch.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfileView;
