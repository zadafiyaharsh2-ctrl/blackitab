import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import { 
    FolderIcon, 
    UserIcon, 
    UsersIcon,
    ChevronDownIcon, 
    ChevronUpIcon,
    Square3Stack3DIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const HierarchyNode = ({ title, subtitle, icon: Icon, children, defaultExpanded = false, indent = false, badge }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] overflow-hidden ${indent ? 'ml-4 md:ml-8 border-l-2 border-l-blue-400 dark:border-l-blue-500' : ''}`}>
            <button 
                onClick={() => setExpanded(!expanded)} 
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${expanded ? 'border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-200 dark:border-blue-500/20">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{title}</span>
                            {badge && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/5">{badge}</span>}
                        </div>
                        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
                    </div>
                </div>
                {expanded ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
            </button>
            {expanded && (
                <div className="p-4 bg-gray-50/30 dark:bg-transparent space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
};

const InstituteHierarchy = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const res = await api.get('/institute/hierarchy');
            if (res.data.success) {
                setHierarchy(res.data.data);
            }
        } catch (error) {
            CustomToast.error('Failed to load institute hierarchy');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageShimmer variant="cards" />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Square3Stack3DIcon className="w-6 h-6 text-gray-400" />
                    Organizational Hierarchy
                </h1>
                <p className="text-sm text-gray-500 mt-1">Navigate through your institute's departments, teachers, batches, and students structurally.</p>
            </div>

            {hierarchy.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/[0.02]">
                    <Square3Stack3DIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No organizational data found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {hierarchy.map((dept, idx) => (
                        <HierarchyNode 
                            key={idx} 
                            title={dept.department} 
                            subtitle={`${dept.teachers.length} Teacher(s)  •  ${dept.unassignedStudents.length} Independent Student(s)`}
                            icon={FolderIcon}
                        >
                            {dept.teachers.length === 0 && dept.unassignedStudents.length === 0 && (
                                <p className="text-sm text-gray-500 italic p-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-center">Empty Department</p>
                            )}

                            {/* Teachers & their batches */}
                            {dept.teachers.map(teacher => (
                                <HierarchyNode 
                                    key={teacher._id}
                                    title={teacher.name}
                                    subtitle={teacher.email}
                                    icon={UserIcon}
                                    indent={true}
                                    badge={teacher.role}
                                >
                                    {teacher.batches.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic p-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-center bg-white dark:bg-white/[0.02]">No active batches managed.</p>
                                    ) : (
                                        teacher.batches.map(batch => (
                                            <HierarchyNode 
                                                key={batch._id}
                                                title={`${batch.name} (${batch.year} ${batch.section})`}
                                                subtitle={`${batch.students.length} Student(s)`}
                                                icon={UsersIcon}
                                                indent={true}
                                                badge="BATCH"
                                            >
                                                {batch.students.length === 0 ? (
                                                    <p className="text-xs text-gray-500 italic p-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg text-center bg-white dark:bg-white/[0.02]">No students enrolled.</p>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {batch.students.map(student => (
                                                            <div 
                                                                key={student._id} 
                                                                onClick={() => navigate(`/institute/student/${student._id}`)}
                                                                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-colors"
                                                            >
                                                                <div className="w-7 h-7 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{student.name}</p>
                                                                    <p className="text-[10px] text-gray-500 truncate">{student.email}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </HierarchyNode>
                                        ))
                                    )}
                                </HierarchyNode>
                            ))}

                            {/* Unassigned Students directly under Department */}
                            {dept.unassignedStudents.length > 0 && (
                                <div className="ml-4 md:ml-8 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                                        Independent Students <span className="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px]">{dept.unassignedStudents.length}</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {dept.unassignedStudents.map(student => (
                                            <div 
                                                key={student._id} 
                                                onClick={() => navigate(`/institute/student/${student._id}`)}
                                                className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-colors"
                                            >
                                                <div className="w-7 h-7 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{student.name}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{student.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </HierarchyNode>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstituteHierarchy;
