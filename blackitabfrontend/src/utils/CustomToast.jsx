import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, Sparkles } from 'lucide-react';

/**
 * Custom Toast Manager
 * A context-aware notification system utilizing react-hot-toast.
 * Designed with glassmorphism and animated entry/exit for an addictive UI feel.
 */

// Custom styling base for the glassmorphism effect
const glassToastStyle = {
  background: 'rgba(31, 41, 55, 0.8)', // bg-gray-800/80
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(75, 85, 99, 0.4)', // border-gray-600/40
  color: '#fff',
  padding: '16px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
};

export const CustomToast = {
  success: (message) => {
    toast.success(message, {
      style: {
        ...glassToastStyle,
        border: '1px solid rgba(16, 185, 129, 0.3)', // Emerald border
      },
      iconTheme: {
        primary: '#10b981', // Emerald text
        secondary: '#fff',
      },
    });
  },

  error: (message) => {
    toast.error(message, {
      style: {
        ...glassToastStyle,
        border: '1px solid rgba(239, 68, 68, 0.3)', // Red border
      },
      iconTheme: {
        primary: '#ef4444', 
        secondary: '#fff',
      },
    });
  },

  info: (message) => {
    toast(message, {
      icon: <Info className="text-blue-400 w-5 h-5" />,
      style: {
        ...glassToastStyle,
        border: '1px solid rgba(59, 130, 246, 0.3)', // Blue border
      },
    });
  },

  // Specialized: Level Up / Mastery notification
  achievement: (title, message) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-purple-500/50`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
               <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-400/30">
                  <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
               </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-white text-glow">
                {title}
              </p>
              <p className="mt-1 text-sm text-purple-200/80">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-purple-500/20">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-500/10 focus:outline-none transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  }
};
