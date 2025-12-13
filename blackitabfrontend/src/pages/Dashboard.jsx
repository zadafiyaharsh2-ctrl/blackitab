import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaBook, 
  FaCode, 
  FaTrophy, 
  FaFire, 
  FaChartLine, 
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaDatabase,
  FaLaptopCode,
  FaCloud,
  FaQuoteLeft,
  FaCalendarAlt
} from 'react-icons/fa';
import { MdReportProblem } from 'react-icons/md';
import ActivityHeatmap from '../components/ActivityHeatmap';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [progressStats, setProgressStats] = useState({
    totalCompleted: 0,
    bySubject: []
  });
  
  const [stats, setStats] = useState({
    streak: 0,
    totalPoints: 0,
    rank: 'Loading...'
  });

  const [quote, setQuote] = useState({ text: '', author: '' });

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "Java is to JavaScript what car is to Carpet.", author: "Chris Heilmann" }
  ];

  const nextContest = {
    title: "Bi-Weekly Contest #12",
    date: "Tomorrow, 8:00 PM",
    participants: 530,
    link: "/contest"
  };

  const problemOfTheDay = {
    title: "Merge K Sorted Lists",
    difficulty: "Hard",
    topic: "Linked List",
    link: "/problems"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Fetch subjects
        const subjectsRes = await axios.get('http://localhost:5000/api/subjects');
        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }

        // Fetch progress stats if logged in
        if (token) {
          const progressRes = await axios.get('http://localhost:5000/api/progress/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (progressRes.data.success) {
            setProgressStats(progressRes.data.data);
            setStats({
              streak: progressRes.data.data.streak || 0,
              totalPoints: progressRes.data.data.totalPoints || 0,
              rank: progressRes.data.data.rank || 'Unranked'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  // Stats cards data
  const statsCards = [
    {
      title: 'Topics Completed',
      value: progressStats.totalCompleted,
      icon: FaCheckCircle,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Current Streak',
      value: `${stats.streak} days`,
      icon: FaFire,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Points',
      value: stats.totalPoints,
      icon: FaTrophy,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Rank',
      value: stats.rank,
      icon: FaChartLine,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Theory',
      description: 'Learn DBMS, SQL, CCBDI',
      icon: FaBook,
      link: '/theory',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Practice Problems',
      description: 'Solve coding challenges',
      icon: MdReportProblem,
      link: '/problems',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'IDE',
      description: 'Code online',
      icon: FaLaptopCode,
      link: '/ide',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Analytics',
      description: 'Track your progress',
      icon: FaChartLine,
      link: '/analytics',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  // Calculate dynamic subject progress
  const recentSubjects = subjects.map(subject => {
    // Find progress for this subject
    const subjectProgress = progressStats.bySubject.find(s => s._id === subject._id);
    const completed = subjectProgress ? subjectProgress.totalCompleted : 0;
    const total = subject.topicCount || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Determine icon and color based on subject name (fallback defaults)
    let icon = FaBook;
    let color = 'text-gray-600';
    let barColor = 'from-gray-500 to-gray-600';
    
    if (subject.name === 'DBMS') {
      icon = FaDatabase;
      color = 'text-blue-600';
      barColor = 'from-blue-500 to-blue-600';
    } else if (subject.name === 'SQL') {
      icon = FaCode;
      color = 'text-green-600';
      barColor = 'from-green-500 to-green-600';
    } else if (subject.name === 'CCBDI') {
      icon = FaCloud;
      color = 'text-purple-600';
      barColor = 'from-purple-500 to-purple-600';
    }

    return {
      name: subject.name,
      icon,
      progress: percentage,
      completed,
      total,
      color,
      barColor
    };
  });

  // Recent activity (Placeholder for now, could be fetched from API if we had an activity log)
  const recentActivity = [
    { action: 'Completed', item: 'Normal Forms in DBMS', time: '2 hours ago', type: 'theory' },
    { action: 'Solved', item: 'Two Sum Problem', time: '5 hours ago', type: 'problem' },
    { action: 'Started', item: 'SQL Joins Tutorial', time: '1 day ago', type: 'theory' },
    { action: 'Achieved', item: '7 Day Streak!', time: '1 day ago', type: 'achievement' }
  ];

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
          Welcome back, {user?.name || 'Student'}! 👋
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Here's what's happening with your learning journey today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`${isDark ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-100'} backdrop-blur-sm rounded-2xl shadow-lg p-5 border flex items-center justify-between group hover:border-blue-500/30 transition-all duration-300`}
          >
            <div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium mb-1`}>{stat.title}</p>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} group-hover:text-blue-400 transition-colors`}>
                {stat.value}
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor.replace('bg-', 'bg-opacity-10 bg-')} ${stat.textColor} group-hover:scale-110 transition-transform`}>
              <stat.icon className="text-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Row 1: Motivation (2) & Problem (1) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[200px]">
          <FaQuoteLeft className="text-white opacity-10 text-8xl absolute -top-4 -left-4" />
          <div className="relative z-10">
            <h3 className="text-indigo-200 font-semibold mb-3 uppercase tracking-wider text-sm">Daily Motivation</h3>
            <p className="text-2xl md:text-3xl font-bold italic mb-6 leading-relaxed">"{quote.text}"</p>
            <p className="text-white font-medium flex items-center">
              <span className="w-8 h-0.5 bg-indigo-400 mr-3"></span>
              {quote.author}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <FaTrophy className="text-9xl transform translate-x-10 translate-y-10" />
          </div>
        </div>

        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-700/50 flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <FaCode className="text-8xl text-indigo-600 transform rotate-12" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FaCode className="text-xl" />
            </div>
            <span className="px-3 py-1 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full">
              {problemOfTheDay.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1 relative z-10">Problem of the Day</h3>
          <p className="text-gray-400 text-sm mb-4 relative z-10">{problemOfTheDay.title}</p>
          <div className="mt-auto relative z-10">
            <Link 
              to={problemOfTheDay.link}
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Solve Challenge <FaArrowRight className="ml-2 text-xs" />
            </Link>
          </div>
        </div>

        {/* Row 2: Heatmap (2) & Contest (1) */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 p-1 overflow-hidden">
           <div className="p-5 border-b border-gray-700/50">
             <h3 className="font-bold text-white flex items-center">
               <FaFire className="text-orange-500 mr-2" /> Activity Log
             </h3>
           </div>
           <div className="p-4">
             <ActivityHeatmap />
           </div>
        </div>

        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-700/50 flex flex-col hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white flex items-center">
              <FaTrophy className="text-yellow-500 mr-2" /> Upcoming
            </h3>
            <span className="text-xs font-semibold bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">
              Registered
            </span>
          </div>
          
          <div className="text-center py-4 flex-1 flex flex-col justify-center">
            <h4 className="text-xl font-bold text-white mb-2">{nextContest.title}</h4>
            <div className="flex items-center justify-center text-gray-400 text-sm mb-6">
              <FaCalendarAlt className="mr-2" /> {nextContest.date}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-6">
              <div className="bg-gray-700/50 rounded-lg p-2">
                <span className="block text-xs text-gray-400">Time</span>
                <span className="font-bold text-white">2h</span>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-2">
                <span className="block text-xs text-gray-400">Ques</span>
                <span className="font-bold text-white">4</span>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-2">
                <span className="block text-xs text-gray-400">XP</span>
                <span className="font-bold text-white">100</span>
              </div>
            </div>
          </div>
          
          <Link to={nextContest.link} className="w-full py-2.5 rounded-xl border border-blue-500/50 text-blue-400 font-bold text-sm text-center hover:bg-blue-500/10 transition-colors">
            View Details
          </Link>
        </div>

        {/* Row 3: Progress (2) & Quick Actions (1) */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center">
              <FaChartLine className="mr-2 text-blue-400" />
              Learning Progress
            </h2>
            <Link to="/analytics" className="text-sm text-blue-400 font-medium hover:text-blue-300">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentSubjects.map((subject, index) => (
              <div key={index} className="group flex items-center p-3 rounded-xl hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-700">
                <div className={`p-3 rounded-xl bg-gray-700/50 ${subject.color.replace('text-', 'text-opacity-90 text-')} group-hover:scale-105 transition-transform`}>
                  <subject.icon className="text-xl" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-gray-200">{subject.name}</h3>
                    <span className="text-sm font-bold text-gray-400">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${subject.barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center">
            <FaArrowRight className="mr-2 text-blue-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="flex items-center p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/80 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className={`p-2 rounded-lg bg-gray-800 shadow-sm ${action.color.replace('from-', 'text-').replace('to-', '')} group-hover:text-white group-hover:bg-gradient-to-r ${action.color} transition-all`}>
                  <action.icon className="text-lg" />
                </div>
                <span className="ml-3 font-semibold text-gray-300 group-hover:text-white">{action.title}</span>
                <FaArrowRight className="ml-auto text-gray-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

