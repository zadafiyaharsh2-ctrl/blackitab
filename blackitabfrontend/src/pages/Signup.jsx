import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomToast } from '../utils/CustomToast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import API_URL from '../config';

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        CustomToast.error('Passwords do not match. Please verify.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        CustomToast.error('Your password is too weak. Must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        CustomToast.success('Welcome to Blackitab! Account created successfully.');
        
        if (onSignupSuccess) onSignupSuccess(data.user, data.token);
        navigate('/onboarding');
      } else {
        CustomToast.error(data.message || 'Registration failed. Try again.');
      }
    } catch (err) {
      CustomToast.error('Network error. Unable to reach the servers.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 6;
  const passwordsMatch = formData.password && (formData.password === formData.confirmPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white relative overflow-hidden font-sans p-4">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
      />
      <motion.div 
        animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }} 
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen"
      />

      {/* Main Form Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
             className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-inner"
          >
            <User className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-400 mt-2 text-sm">Join the elite learning platform.</p>
        </div>

        {/* Input Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 text-white placeholder-gray-600 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@domain.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5 text-white placeholder-gray-600 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className={`relative group ${formData.password && !passwordStrength ? 'animate-pulse' : ''}`}>
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${passwordStrength ? 'text-emerald-400' : 'text-gray-500 group-focus-within:text-emerald-400'}`} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
                className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl outline-none transition-all shadow-inner
                  ${formData.password && !passwordStrength ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-white/10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`w-5 h-5 transition-colors ${passwordsMatch ? 'text-emerald-400' : 'text-gray-500 group-focus-within:text-emerald-400'}`} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl outline-none transition-all shadow-inner
                   ${formData.confirmPassword && !passwordsMatch ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-white/10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                tabIndex="-1"
              >
                 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 px-6 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </div>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
