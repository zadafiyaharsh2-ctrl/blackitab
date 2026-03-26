import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CustomToast } from '../../utils/CustomToast';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthBrandingPane from '../../components/public/auth/AuthBrandingPane';
import GoogleAuthDivider from '../../components/public/auth/GoogleAuthDivider';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900 font-sans">
      
      {/* BRANDING PANE - Asymmetrical Split (Left) */}
      <AuthBrandingPane 
        title="Curate Your <br />Scholarly Future."
        subtitle="The Digital Curator. A premium, high-art environment to organize, manage, and excel in your educational journey. No clutter, just clarity."
      />

      {/* FORM PANE - Asymmetrical Split (Right) */}
      <div className="w-full md:w-[55%] lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-200 relative z-10"
        >
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Sign in to access your workspace.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#0061FF]" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="name@institution.edu"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#0061FF] focus:ring-[#0061FF]/10 shadow-sm" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#0061FF]" />
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#0061FF] focus:ring-[#0061FF]/10 shadow-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors" tabIndex="-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="w-full relative overflow-hidden rounded-full text-white font-semibold py-3.5 px-6 transition-all flex items-center justify-center gap-2 bg-[#0061FF] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></>
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <GoogleAuthDivider 
            onSuccess={handleGoogleSuccess} 
            onError={() => CustomToast.error('Google Sign-In was unsuccessful')} 
            label="continue_with" 
          />

          {/* Footer Links */}
          <div className="mt-8 text-center sm:text-left">
            <p className="text-gray-500 text-sm font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-[#0061FF] hover:underline transition-all">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Login;
