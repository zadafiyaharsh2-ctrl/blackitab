import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaEnvelope, FaPlusSquare, FaTimes, FaComment } from 'react-icons/fa';

/**
 * FloatingSocialButton — A floating bottom-right button that opens
 * a mini social-hub panel with quick links to social pages.
 */
const FloatingSocialButton = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const MotionButton = motion.button;

  // Close panel when navigating
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  const socialLinks = [
    { path: '/social', label: 'Social Feed', icon: <FaUsers />, color: 'from-blue-500 to-indigo-600' },
    { path: '/messages', label: 'Messages', icon: <FaEnvelope />, color: 'from-emerald-500 to-teal-600' },
    { path: '/create-post', label: 'Create Post', icon: <FaPlusSquare />, color: 'from-rose-500 to-pink-600' },
  ];

  // Check if we're on a social page
  const isSocialPage = ['/social', '/messages', '/create-post', '/network'].some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998]"
          />
        )}
      </AnimatePresence>

      {/* Social Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 w-[280px] sm:w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] z-[999] overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-200/50 dark:border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <FaUsers /> Social Hub
                </h3>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="p-3 space-y-1">
              {socialLinks.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-lg ${isActive ? '' : 'opacity-70'}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <MotionButton
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[999] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
            : isSocialPage
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/40 ring-2 ring-blue-400/50'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <FaTimes className="text-white text-lg" />
            </motion.span>
          ) : (
            <motion.span key="social" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <FaComment className="text-white text-lg" />
            </motion.span>
          )}
        </AnimatePresence>
      </MotionButton>
    </>
  );
};

export default FloatingSocialButton;
