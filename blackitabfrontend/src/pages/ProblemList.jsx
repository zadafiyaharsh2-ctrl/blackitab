/**
 * ============================================================================
 * PROBLEM LIST PAGE (ProblemList.jsx)
 * ============================================================================
 * 
 * Concept: Immersive, Staggered, Addictive menu for problem solving.
 * Upgraded with Framer Motion and Glassmorphism.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, Clock, ChevronRight, Zap } from 'lucide-react';
import API_URL from '../config';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
};

const ProblemList = () => {
  const { subjectId, chapterId } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        };

        const res = await axios.get(`${API_URL}/api/problems/chapters/${chapterId}/problems`, config);
        
        if (res.data.success) {
          setProblems(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) {
      fetchProblems();
    }
  }, [chapterId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/30 shadow-[inset_0_0_10px_rgba(74,222,128,0.1)]';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 shadow-[inset_0_0_10px_rgba(250,204,21,0.1)]';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/30 shadow-[inset_0_0_10px_rgba(248,113,113,0.1)]';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 pt-8">
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => navigate(`/problems/${subjectId}/chapters`)}
          className="flex items-center text-gray-400 hover:text-purple-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          <span className="font-medium tracking-wide">Back to Framework</span>
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl">
            <Zap className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-glow">Challenge Arena</h1>
            <p className="text-gray-400 mt-1 tracking-wide">Select your next target and conquer it.</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="glass-panel border-white/5 rounded-2xl overflow-hidden shadow-2xl"
          >
            {problems.length > 0 ? (
              <div className="divide-y divide-white/5">
                {problems.map((problem) => (
                  <motion.div
                    variants={itemVariants}
                    key={problem._id}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.03)" }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/problems/view/${problem._id}`)}
                    className="p-5 md:p-6 transition-all cursor-pointer group flex items-center justify-between relative overflow-hidden"
                  >
                    {/* Hover Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />

                    {/* Left Side: Icon & Title */}
                    <div className="flex items-center space-x-5 relative z-10">
                      <div className="flex-shrink-0" title={problem.status?.replace('_', ' ')}>
                        {getStatusIcon(problem.status)}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-200 group-hover:text-white group-hover:text-glow transition-all">
                          {problem.title}
                        </h3>
                        <div className="flex items-center mt-2 space-x-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          {/* Success Rate Meta could go here if available */}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Caret Icon */}
                    <div className="relative z-10 p-2 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
                  <Zap className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-2">Arena Empty</h3>
                <p className="text-gray-500">No challenges have been assigned to this sector yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProblemList;
