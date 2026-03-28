import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import PageShimmer from '../../components/shared/PageShimmer';
import { CustomToast } from '../../utils/CustomToast';
import { 
    CalendarIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    ArrowLeftIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultPeriod = { startTime: '', endTime: '', subject: '', roomNumber: '', isLab: false };

const InstituteTimetable = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [batchDetails, setBatchDetails] = useState(null);
    const [schedule, setSchedule] = useState(
        DAYS.map(day => ({ dayOfWeek: day, periods: [] }))
    );

    useEffect(() => {
        fetchData();
    }, [batchId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch batch basic info
            const batchRes = await api.get(`/teacher/batch/${batchId}`);
            if (batchRes.data.success) {
                setBatchDetails(batchRes.data.data);
            }

            // Fetch timetable
            const ttRes = await api.get(`/institute/timetable/${batchId}`);
            if (ttRes.data.success && ttRes.data.data?.schedule?.length > 0) {
                // Merge fetched schedule with default DAYS to ensure all 7 days exist in UI
                const fetchedMap = new Map(ttRes.data.data.schedule.map(d => [d.dayOfWeek, d.periods]));
                const mergedSchedule = DAYS.map(day => ({
                    dayOfWeek: day,
                    periods: fetchedMap.get(day) || []
                }));
                setSchedule(mergedSchedule);
            }
        } catch (error) {
            CustomToast.error('Failed to load timetable data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPeriod = (dayIndex) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].periods.push({ ...defaultPeriod });
        setSchedule(newSchedule);
    };

    const handleRemovePeriod = (dayIndex, periodIndex) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].periods.splice(periodIndex, 1);
        setSchedule(newSchedule);
    };

    const handlePeriodChange = (dayIndex, periodIndex, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[dayIndex].periods[periodIndex][field] = value;
        setSchedule(newSchedule);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Filter out empty periods to keep DB clean
            const cleanSchedule = schedule.map(day => ({
                dayOfWeek: day.dayOfWeek,
                periods: day.periods.filter(p => p.startTime && p.endTime && p.subject)
            })).filter(day => day.periods.length > 0);

            const res = await api.post(`/institute/timetable/${batchId}`, { schedule: cleanSchedule });
            if (res.data.success) {
                CustomToast.success('Timetable saved successfully!');
                // Re-sync local state
                const fetchedMap = new Map(cleanSchedule.map(d => [d.dayOfWeek, d.periods]));
                setSchedule(DAYS.map(day => ({
                    dayOfWeek: day,
                    periods: fetchedMap.get(day) || []
                })));
            }
        } catch (error) {
            CustomToast.error(error.response?.data?.message || 'Failed to save timetable');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageShimmer variant="cards" />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-2">
                        <ArrowLeftIcon className="w-4 h-4" /> Go Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-indigo-500" />
                        Timetable Management
                    </h1>
                    {batchDetails && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{batchDetails.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                {batchDetails.year} {batchDetails.section}
                            </span>
                        </p>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 justify-center shrink-0"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {schedule.map((dayObj, dayIndex) => (
                    <div key={dayObj.dayOfWeek} className="bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white tracking-wide">{dayObj.dayOfWeek}</h3>
                            <button
                                onClick={() => handleAddPeriod(dayIndex)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Period
                            </button>
                        </div>
                        
                        <div className="p-4">
                            {dayObj.periods.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-4">No periods scheduled for {dayObj.dayOfWeek}.</p>
                            ) : (
                                <div className="space-y-3">
                                    {dayObj.periods.map((period, periodIndex) => (
                                        <div key={periodIndex} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 group">
                                            
                                            <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                                                <ClockIcon className="w-5 h-5 text-gray-400 shrink-0" />
                                                <input 
                                                    type="time" 
                                                    value={period.startTime} 
                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'startTime', e.target.value)}
                                                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 focus:ring-1 outline-none"
                                                    required
                                                />
                                                <span className="text-gray-400 text-sm">to</span>
                                                <input 
                                                    type="time" 
                                                    value={period.endTime} 
                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'endTime', e.target.value)}
                                                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 focus:ring-1 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                                                <AcademicCapIcon className="w-5 h-5 text-gray-400 shrink-0" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Subject Name"
                                                    value={period.subject} 
                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'subject', e.target.value)}
                                                    className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 focus:ring-1 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 flex-1 w-full md:w-auto">
                                                <input 
                                                    type="text" 
                                                    placeholder="Room (e.g., L-401)"
                                                    value={period.roomNumber} 
                                                    onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'roomNumber', e.target.value)}
                                                    className="w-24 md:w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 focus:ring-1 outline-none"
                                                />
                                                <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer w-20">
                                                    <input 
                                                        type="checkbox"
                                                        checked={period.isLab}
                                                        onChange={(e) => handlePeriodChange(dayIndex, periodIndex, 'isLab', e.target.checked)}
                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    Lab
                                                </label>
                                            </div>

                                            <button
                                                onClick={() => handleRemovePeriod(dayIndex, periodIndex)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded border border-transparent hover:border-red-200 dark:hover:border-red-500/30 transition-colors md:opacity-0 group-hover:opacity-100"
                                                title="Remove period"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-end pt-4 pb-12 block md:hidden">
                 <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default InstituteTimetable;
