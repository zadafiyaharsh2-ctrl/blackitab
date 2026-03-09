import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CustomToast } from '../utils/CustomToast';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, GraduationCap, BookOpen, Shield, Building } from 'lucide-react';
import API_URL from '../config';

/**
 * Role-based redirect map.
 * After login the user lands on the page most relevant to their role.
 */
const ROLE_REDIRECT = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  hod: '/teacher-dashboard',
  institute_admin: '/institute/dashboard',
};

/**
 * Demo accounts — these let reviewers/devs quickly test each role.
 * They only work when the seed script has been run against the DB.
 */
const DEMO_ACCOUNTS = [
  { role: 'student',         label: 'Student',         email: 'student@blackitab.demo',   password: 'demo1234', icon: GraduationCap, color: 'from-blue-500 to-cyan-500',    border: 'border-blue-500/30' },
  { role: 'teacher',         label: 'Teacher',         email: 'teacher@blackitab.demo',   password: 'demo1234', icon: BookOpen,       color: 'from-emerald-500 to-teal-500', border: 'border-emerald-500/30' },
  { role: 'hod',             label: 'HOD',             email: 'hod@blackitab.demo',       password: 'demo1234', icon: Shield,         color: 'from-purple-500 to-pink-500',  border: 'border-purple-500/30' },
  { role: 'institute_admin', label: 'Institute Admin', email: 'institute@blackitab.demo', password: 'demo1234', icon: Building,       color: 'from-orange-500 to-red-500',   border: 'border-orange-500/30' },
];

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Core login function — used by both the form and the demo buttons.
   */
  const doLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        CustomToast.success(`Welcome back, ${data.user.name}!`);
        if (onLoginSuccess) onLoginSuccess(data.user, data.token);

        // Role-based redirect
        const dest = ROLE_REDIRECT[data.user.role] || '/dashboard';
        navigate(dest);
      } else {
        CustomToast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      CustomToast.error('Network error. Unable to reach the servers.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(formData.email, formData.password);
  };

  const handleDemoLogin = async (demo) => {
    setFormData({ email: demo.email, password: demo.password });
    await doLogin(demo.email, demo.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden font-sans p-4">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/10">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/20 dark:border-white/10 flex items-center justify-center shadow-inner">
            <LogIn className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Sign in to continue to Blackitab</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="you@domain.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:bg-blue-500/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 dark:focus:bg-blue-500/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition-colors" tabIndex="-1">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="group w-full relative overflow-hidden rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold py-3.5 px-6 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </motion.button>
          </div>
        </form>

        {/* Demo Login Panel */}
        <div className="mt-6">
          <button onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="w-full text-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2">
            {showDemoPanel ? '▲ Hide demo accounts' : '▼ Quick demo login (for testing)'}
          </button>

          {showDemoPanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((d) => {
                  const Icon = d.icon;
                  return (
                    <button key={d.role} onClick={() => handleDemoLogin(d)} disabled={loading}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${d.border} bg-gray-50 hover:bg-gray-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] transition-all text-center group`}>
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{d.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-1">
                Demo accounts require the seed script to be run first
              </p>
            </motion.div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center border-t border-gray-200 dark:border-white/10 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
