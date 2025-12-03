import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaFire } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ActivityHeatmap = () => {
  const { isDark } = useTheme();
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get('http://localhost:5000/api/progress/heatmap', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setHeatmapData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching heatmap data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, []);

  // Scroll to end on load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [heatmapData, loading]);

  // Generate last 365 days
  const generateCalendarData = () => {
    const today = new Date();
    const days = [];
    // Start from 364 days ago
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const activity = heatmapData.find(d => d.date === dateStr);
      days.push({
        date: dateStr,
        count: activity ? activity.count : 0,
        fullDate: date
      });
    }
    return days;
  };

  const calendarData = generateCalendarData();

  // Group by weeks for grid display (vertical weeks)
  // We need to align the first day to the correct weekday
  const weeks = [];
  let currentWeek = [];
  
  // Pad the beginning if the first day isn't Sunday (0)
  const firstDay = new Date(calendarData[0].fullDate);
  const startDay = firstDay.getDay(); // 0-6
  
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null);
  }

  calendarData.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Push remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getColor = (count) => {
    if (count === 0) return isDark ? 'bg-gray-800' : 'bg-gray-100';
    if (count <= 2) return isDark ? 'bg-green-800/30' : 'bg-green-200';
    if (count <= 5) return isDark ? 'bg-green-600/50' : 'bg-green-400';
    if (count <= 8) return isDark ? 'bg-green-500/70' : 'bg-green-600';
    return isDark ? 'bg-green-400' : 'bg-green-800';
  };

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 border h-full flex items-center justify-center`}>
        <div className="animate-spin h-8 w-8 border-b-2 border-green-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 border overflow-hidden`}>
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6 flex items-center`}>
        <FaFire className="mr-3 text-green-600" />
        Activity Heatmap
      </h2>
      
      <div className="overflow-x-auto pb-2" ref={scrollRef}>
        <div className="min-w-max">
          <div className="flex">
            <div className="grid grid-flow-col grid-rows-7 gap-1 h-[100px]">
              {/* Add empty cells for start offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="w-3 h-3"></div>
              ))}

              {calendarData.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors hover:ring-2 hover:ring-green-600 cursor-pointer`}
                  title={`${day.count} activities on ${day.date}`}
                ></div>
              ))}
            </div>
          </div>
          
          <div className={`flex items-center justify-end mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} space-x-2`}>
            <span>Less</span>
            <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
            <div className="w-3 h-3 rounded-sm bg-green-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600"></div>
            <div className="w-3 h-3 rounded-sm bg-green-800"></div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
