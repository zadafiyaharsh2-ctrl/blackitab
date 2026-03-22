import React, { useMemo } from 'react';

/**
 * AttendanceGrid — Spreadsheet-style attendance view like a university register.
 * 
 * Props:
 *   records: Array of { date: string, records: [{ studentId: { _id, name } | string, status: 'Present'|'Absent'|'Late' }] }
 *   students: Array of { _id, name, email? } — enrolled student list (optional, derived from records if not given)
 */
const AttendanceGrid = ({ records = [], students: externalStudents = [] }) => {

    const { months, studentMap, orderedStudents, datesByMonth } = useMemo(() => {
        const allCombinedKeys = [...new Set(records.map(r => {
            if (!r.date) return null;
            const ds = r.date.split('T')[0];
            const st = r.sessionType || 'Class';
            return `${ds}|${st}`;
        }).filter(Boolean))].sort();

        // Group columns by month
        const datesByMonth = {};
        allCombinedKeys.forEach(combinedKey => {
            const dateStr = combinedKey.split('|')[0];
            const d = new Date(dateStr + 'T00:00:00');
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (!datesByMonth[monthKey]) datesByMonth[monthKey] = [];
            datesByMonth[monthKey].push(combinedKey);
        });

        const months = Object.keys(datesByMonth).sort();

        // Build student map: { studentId: { name, email, attendance: { [dateStr]: status } } }
        const studentMap = {};

        // First add external students if provided
        externalStudents.forEach(s => {
            const sid = s._id || s;
            if (!studentMap[sid]) {
                studentMap[sid] = { name: s.name || 'Unknown', email: s.email || '', attendance: {} };
            }
        });

        // Then fill in attendance from records
        records.forEach(rec => {
            const dateStr = rec.date?.split('T')[0];
            if (!dateStr) return;
            const sType = rec.sessionType || 'Class';
            const combinedKey = `${dateStr}|${sType}`;

            (rec.records || []).forEach(entry => {
                const sid = typeof entry.studentId === 'object' ? entry.studentId?._id : entry.studentId;
                const sName = typeof entry.studentId === 'object' ? entry.studentId?.name : null;
                if (!sid) return;
                if (!studentMap[sid]) {
                    studentMap[sid] = { name: sName || 'Unknown', email: '', attendance: {} };
                }
                if (sName && studentMap[sid].name === 'Unknown') {
                    studentMap[sid].name = sName;
                }
                studentMap[sid].attendance[combinedKey] = entry.status;
            });
        });

        const orderedStudents = Object.entries(studentMap)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return { months, studentMap, orderedStudents, datesByMonth };
    }, [records, externalStudents]);

    if (records.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                <p className="text-sm text-gray-500">No attendance records available to display.</p>
            </div>
        );
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const allDatesFlat = months.flatMap(m => datesByMonth[m]);
    const totalSessions = allDatesFlat.length;

    const getStatusChar = (status) => {
        if (status === 'Present') return 'P';
        if (status === 'Absent') return 'A';
        if (status === 'Late') return 'L';
        if (status === 'No Class') return 'N';
        return '—';
    };

    const getStatusColor = (status) => {
        if (status === 'Present') return 'text-green-700 dark:text-green-400';
        if (status === 'Absent') return 'text-red-600 dark:text-red-400 font-bold';
        if (status === 'Late') return 'text-amber-600 dark:text-amber-400';
        if (status === 'No Class') return 'text-gray-500 dark:text-gray-500';
        return 'text-gray-300 dark:text-gray-600';
    };

    const getStatusBg = (status) => {
        if (status === 'Absent') return 'bg-red-50 dark:bg-red-500/10';
        if (status === 'No Class') return 'bg-gray-50 dark:bg-gray-500/5';
        return '';
    };

    const getPercentColor = (pct) => {
        if (pct >= 75) return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10';
        if (pct >= 50) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10';
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
    };

    return (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-white/[0.02]">
            <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse" style={{ minWidth: `${400 + allDatesFlat.length * 32}px` }}>
                    <thead>
                        {/* Month row */}
                        <tr className="bg-gray-100 dark:bg-white/[0.05] border-b border-gray-200 dark:border-white/10">
                            <th className="sticky left-0 z-20 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 min-w-[40px]">
                                S.No
                            </th>
                            <th className="sticky left-[40px] z-20 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-left font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 min-w-[160px]">
                                Student Name
                            </th>
                            {months.map(monthKey => {
                                const [y, m] = monthKey.split('-');
                                const dates = datesByMonth[monthKey];
                                return (
                                    <th key={monthKey} colSpan={dates.length}
                                        className="px-1 py-2 text-center font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 bg-blue-50 dark:bg-blue-500/10">
                                        {monthNames[parseInt(m) - 1]} {y.slice(2)}
                                    </th>
                                );
                            })}
                            <th className="px-2 py-2 text-center font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-r border-gray-200 dark:border-white/10 min-w-[44px]">
                                Total P
                            </th>
                            <th className="px-2 py-2 text-center font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-r border-gray-200 dark:border-white/10 min-w-[44px]">
                                Total A
                            </th>
                            <th className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-white/10 min-w-[44px]">
                                Total
                            </th>
                            <th className="px-2 py-2 text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 min-w-[56px]">
                                Present %
                            </th>
                        </tr>
                        {/* Date sub-header row */}
                        <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10">
                            <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-white/10"></th>
                            <th className="sticky left-[40px] z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-white/10"></th>
                            {allDatesFlat.map(combinedKey => {
                                const [dateStr, sType] = combinedKey.split('|');
                                const d = new Date(dateStr + 'T00:00:00');
                                return (
                                    <th key={combinedKey} className="px-1 py-1.5 text-center text-[10px] font-semibold text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-white/5 min-w-[36px]">
                                        <div className="flex flex-col items-center">
                                            <span>{d.getDate()}</span>
                                            <span className="text-[8px] opacity-70 uppercase tracking-tighter" title={sType}>{sType.charAt(0)}</span>
                                        </div>
                                    </th>
                                );
                            })}
                            <th className="border-r border-gray-200 dark:border-white/10"></th>
                            <th className="border-r border-gray-200 dark:border-white/10"></th>
                            <th className="border-r border-gray-200 dark:border-white/10"></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {orderedStudents.map((student, idx) => {
                            let totalP = 0, totalA = 0, totalL = 0, totalN = 0;
                            allDatesFlat.forEach(d => {
                                const s = student.attendance[d];
                                if (s === 'Present') totalP++;
                                else if (s === 'Absent') totalA++;
                                else if (s === 'No Class') totalN++;
                                else if (s === 'Late') totalL++;
                            });
                            const total = totalP + totalA + totalL;
                            const pct = total > 0 ? Math.round((totalP / total) * 100) : 0;
                            // Note: 'No Class' days are NOT counted in the total or percentage

                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                    {/* S.No */}
                                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-950 px-3 py-2 text-center text-gray-500 font-medium border-r border-gray-100 dark:border-white/5">
                                        {idx + 1}
                                    </td>
                                    {/* Name */}
                                    <td className="sticky left-[40px] z-10 bg-white dark:bg-gray-950 px-3 py-2 font-semibold text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/5 truncate max-w-[160px]" title={student.name}>
                                        {student.name}
                                    </td>
                                    {/* Date cells */}
                                    {allDatesFlat.map(combinedKey => {
                                        const status = student.attendance[combinedKey];
                                        return (
                                            <td key={combinedKey} className={`px-1 py-2 text-center border-r border-gray-50 dark:border-white/[0.03] ${getStatusBg(status)}`}>
                                                <span className={`text-[11px] font-bold ${getStatusColor(status)}`}>
                                                    {status ? getStatusChar(status) : '—'}
                                                </span>
                                            </td>
                                        );
                                    })}
                                    {/* Total P */}
                                    <td className="px-2 py-2 text-center font-bold text-green-700 dark:text-green-400 border-r border-gray-100 dark:border-white/5">
                                        {totalP}
                                    </td>
                                    {/* Total A */}
                                    <td className="px-2 py-2 text-center font-bold text-red-600 dark:text-red-400 border-r border-gray-100 dark:border-white/5">
                                        {totalA}
                                    </td>
                                    {/* Total Sessions */}
                                    <td className="px-2 py-2 text-center font-bold text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-white/5">
                                        {total}
                                    </td>
                                    {/* Present % */}
                                    <td className={`px-2 py-2 text-center font-bold ${getPercentColor(pct)}`}>
                                        {pct}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {/* Summary bar */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between text-xs text-gray-500">
                <span>{orderedStudents.length} students · {totalSessions} sessions recorded</span>
                <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block"></span> Present</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span> Absent</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span> Late</span>
                </span>
            </div>
        </div>
    );
};

export default AttendanceGrid;
