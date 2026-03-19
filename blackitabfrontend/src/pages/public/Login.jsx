import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CustomToast } from '../../utils/CustomToast';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import API_URL from '../../config';

/**
 * Role-based redirect map.
 * After login the user lands on the page most relevant to their role.
 */
const ROLE_REDIRECT = {
  student: '/dashboard',
  teacher: '/teacher-dashboard',
  hod: '/teacher-dashboard',
  institute_admin: '/institute/dashboard',
  institute: '/institute/dashboard',
};

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Core login function — used by the email/password form
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

  /**
   * Google OAuth login handler
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: credentialResponse.credential,
          clientId: credentialResponse.clientId
        }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        CustomToast.success(`Welcome back, ${data.user.name}!`);
        if (onLoginSuccess) onLoginSuccess(data.user, data.token);

        const dest = ROLE_REDIRECT[data.user.role] || '/dashboard';
        navigate(dest);
      } else {
        CustomToast.error(data.message || 'Google Login failed.');
      }
    } catch (err) {
      CustomToast.error('Network error. Unable to reach the servers.');
      console.error('Google Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden font-sans p-4">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/10 mt-8 mb-8">

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br border flex items-center justify-center shadow-inner from-emerald-500/10 to-blue-500/10 border-emerald-500/20 dark:from-white/5 dark:to-white/10 dark:border-white/10">
            <User className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Sign in to continue to Blackitab
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400" />
              </div>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="you@domain.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner focus:ring-emerald-500/50 focus:border-emerald-500/50 dark:focus:bg-emerald-500/5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400" />
              </div>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner focus:ring-emerald-500/50 focus:border-emerald-500/50 dark:focus:bg-emerald-500/5" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition-colors" tabIndex="-1">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="group w-full relative overflow-hidden rounded-xl text-white font-bold py-3.5 px-6 transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </motion.button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-6">
          <div className="relative flex justify-center text-sm mb-6">
            <span className="bg-gray-50 dark:bg-[#0a0a0a] px-2 text-gray-500 dark:text-gray-400 -mt-3">Or continue with</span>
          </div>
          
          <div className="flex justify-center flex-col items-center gap-2 w-full custom-google-btn-container">
            <style jsx>{`
              .custom-google-btn-container > div {
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
              }
              .custom-google-btn-container iframe {
                margin: 0 auto !important;
              }
            `}</style>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => CustomToast.error('Google Sign-In was unsuccessful')}
              useOneTap
              theme="filled_blue"
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center border-t border-gray-200 dark:border-white/10 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold transition-colors text-emerald-500 hover:text-emerald-400 dark:text-emerald-400 dark:hover:text-emerald-300">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
