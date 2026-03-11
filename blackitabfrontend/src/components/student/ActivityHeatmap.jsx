import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config';

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

        const res = await axios.get(`${API_URL}/api/progress/heatmap`, {
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

  // Auto-scroll to latest days
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [heatmapData, loading]);

  // Generate last 365 days
  const generateCalendarData = () => {
    const today = new Date();
    const days = [];

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dateStr = date.toISOString().split('T')[0];
      const activity = heatmapData.find((d) => d.date === dateStr);

      days.push({
        date: dateStr,
        count: activity ? activity.count : 0,
        fullDate: date
      });
    }
    return days;
  };

  const calendarData = generateCalendarData();

  const firstDay = new Date(calendarData[0].fullDate).getDay();

  // 🌙 DARK MODE (low = dark → high = bright)
  // ☀️ LIGHT MODE (reverse shades)
  const getColor = (count) => {
    if (isDark) {
      if (count === 0) return "bg-white/5 border border-white/10";
      if (count < 2) return "bg-emerald-900/80 border border-emerald-800/50 shadow-[0_0_8px_rgba(6,95,70,0.5)]";
      if (count < 5) return "bg-emerald-700 border border-emerald-500/50 shadow-[0_0_12px_rgba(4,120,87,0.6)]";
      if (count < 10) return "bg-emerald-500 border border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.8)]";
      if (count < 15) return "bg-emerald-400 border border-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.9)]";
      return "bg-emerald-300 border border-white shadow-[0_0_25px_rgba(110,231,183,1)]";
    } else {
      if (count === 0) return "bg-slate-100 border border-slate-200";
      if (count < 2) return "bg-emerald-200";
      if (count < 5) return "bg-emerald-400";
      if (count < 10) return "bg-emerald-500 shadow-md";
      if (count < 15) return "bg-emerald-600 shadow-lg";
      return "bg-emerald-700 shadow-xl";
    }
  };

  // Legend levels (represent sample counts)
  const legendLevels = [0, 2, 5, 8, 10];

  if (loading) {
    return (
      <div className={`${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white border-gray-100'} rounded-2xl shadow-lg p-6 border h-full flex items-center justify-center`}>
        <div className=" h-8 w-8 border-b-2 border-orange-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20  ' : 'bg-white border-gray-200'} rounded-2xl shadow-lg p-6 border overflow-hidden`}>

      <div className="overflow-x-auto pb-2" ref={scrollRef}>
        <div className="min-w-max">

          {/* Heatmap Grid */}
          <div className="flex">
            <div className="grid grid-flow-col grid-rows-7 gap-1 h-[100px]">

              {/* Start padding */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="w-3 h-3"></div>
              ))}

              {/* Actual Heatmap Cells */}
              {calendarData.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)}   hover:ring-white cursor-pointer  z-10 relative`}
                  title={`${day.count} activities on ${day.date}`}
                ></div>
              ))}
            </div>
          </div>

          {/* Dynamic Legend - NOW WORKS IN DARK/LIGHT MODE */}
          <div className={`flex items-center justify-end mt-4 text-xs font-semibold ${isDark ? 'text-white/70' : 'text-slate-500'} space-x-2`}>
            <span>Less</span>

            {legendLevels.map((level, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm ${getColor(level)}`}
              ></div>
            ))}

            <span>More</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ActivityHeatmap;
