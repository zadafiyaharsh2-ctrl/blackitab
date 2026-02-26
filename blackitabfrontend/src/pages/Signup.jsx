import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomToast } from '../utils/CustomToast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building, GraduationCap, BookOpen, Shield } from 'lucide-react';
import API_URL from '../config';
import axios from 'axios';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, desc: 'Learn, practice, and compete' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Create exams, manage classes' },
  { id: 'hod', label: 'HOD', icon: Shield, desc: 'Supervise teachers & divisions' },
  { id: 'institute_admin', label: 'Institute Admin', icon: Building, desc: 'Manage your institute' },
];

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = details, 2 = role + institute
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    instituteCode: '',
    batchYear: '',
    division: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [instituteName, setInstituteName] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const verifyInstituteCode = async (code) => {
    if (!code || code.length < 2) { setInstituteName(''); return; }
    try {
      setVerifyingCode(true);
      const res = await axios.get(`${API_URL}/api/institute/verify/${code}`);
      if (res.data.success) {
        setInstituteName(res.data.data.name);
      }
    } catch {
      setInstituteName('');
    }
    setVerifyingCode(false);
  };

  const handleNextStep = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      CustomToast.error('Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      CustomToast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      CustomToast.error('Password must be at least 6 characters.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate institute code for non-student roles
      if (formData.role !== 'student' && !formData.instituteCode) {
        CustomToast.error('Institute code is required for your role.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          instituteCode: formData.instituteCode || undefined,
          batchYear: formData.batchYear || undefined,
          division: formData.division || undefined,
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
  const showInstituteFields = formData.role !== 'student';

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
        {/* Step indicator */}
        <div className="flex gap-2 mb-6 justify-center">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-emerald-500' : 'w-6 bg-emerald-500/40'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-emerald-500' : 'w-6 bg-white/10'}`} />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
             className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-inner"
          >
            {step === 1 ? <User className="w-8 h-8 text-emerald-400" /> : <Building className="w-8 h-8 text-purple-400" />}
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
            {step === 1 ? 'Create Account' : 'Choose Your Role'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {step === 1 ? 'Join the elite learning platform.' : 'What best describes you?'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                    </div>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange} required
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
                      type="email" name="email" value={formData.email} onChange={handleChange} required
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
                      type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                      placeholder="Min 6 characters"
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl outline-none transition-all shadow-inner
                        ${formData.password && !passwordStrength ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-white/10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5'}
                      `}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors" tabIndex="-1">
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
                      type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                      placeholder="Re-enter password"
                      className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl outline-none transition-all shadow-inner
                         ${formData.confirmPassword && !passwordsMatch ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-white/10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 focus:bg-emerald-500/5'}
                      `}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors" tabIndex="-1">
                       {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={handleNextStep}
                    className="group w-full relative overflow-hidden rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 px-6 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Role Selection + Institute */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
                {/* Role Selection Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => {
                    const Icon = r.icon;
                    const isSelected = formData.role === r.id;
                    return (
                      <button
                        key={r.id} type="button"
                        onClick={() => setFormData({ ...formData, role: r.id })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-400' : 'text-gray-400'}`} />
                        <span className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{r.label}</span>
                        <span className="text-[10px] text-gray-500 leading-tight">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Institute Code (conditionally shown) */}
                <AnimatePresence>
                  {showInstituteFields && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Institute Code *</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building className="w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                          </div>
                          <input
                            type="text" name="instituteCode" value={formData.instituteCode}
                            onChange={(e) => { handleChange(e); verifyInstituteCode(e.target.value); }}
                            required placeholder="e.g. PICT2024"
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-600 outline-none transition-all uppercase"
                          />
                        </div>
                        {verifyingCode && <p className="text-xs text-gray-500 ml-1">Verifying...</p>}
                        {instituteName && <p className="text-xs text-emerald-400 ml-1 font-medium">✓ {instituteName}</p>}
                        {formData.instituteCode && !instituteName && !verifyingCode && <p className="text-xs text-red-400 ml-1">Institute not found</p>}
                      </div>

                      {/* Batch & Division (for students/teachers) */}
                      {formData.role !== 'institute_admin' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Batch Year</label>
                            <input
                              type="text" name="batchYear" value={formData.batchYear} onChange={handleChange}
                              placeholder="e.g. 2025"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-600 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Division</label>
                            <input
                              type="text" name="division" value={formData.division} onChange={handleChange}
                              placeholder="e.g. A"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-600 outline-none transition-all"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Institute code optional for students */}
                {formData.role === 'student' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Institute Code (Optional)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building className="w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                      </div>
                      <input
                        type="text" name="instituteCode" value={formData.instituteCode}
                        onChange={(e) => { handleChange(e); verifyInstituteCode(e.target.value); }}
                        placeholder="Leave empty if independent"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-600 outline-none transition-all uppercase"
                      />
                    </div>
                    {instituteName && <p className="text-xs text-emerald-400 ml-1 font-medium">✓ {instituteName}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading || (showInstituteFields && !instituteName)}
                    className={`group w-full relative overflow-hidden rounded-xl font-bold py-3.5 px-6 transition-all flex items-center justify-center gap-2 ${
                      loading || (showInstituteFields && !instituteName)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                    }`}
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

                  <button type="button" onClick={() => setStep(1)}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors">
                    ← Back to details
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

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
