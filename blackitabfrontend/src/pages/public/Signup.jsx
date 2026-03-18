import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomToast } from '../../utils/CustomToast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building, GraduationCap, BookOpen } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import API_URL from '../../config';
import axios from 'axios';

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [accountType, setAccountType] = useState('student'); // 'student', 'teacher', or 'institute'
  const [step, setStep] = useState(1); // 1 = personal, 2 = institute (optional) for student
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instituteCode: '',
    batchYear: '',
    division: '',
    instituteName: '', // For institute registration
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [joinedInstituteName, setJoinedInstituteName] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const verifyInstituteCode = async (code) => {
    if (!code || code.length < 2) { setJoinedInstituteName(''); return; }
    try {
      setVerifyingCode(true);
      const res = await axios.get(`${API_URL}/api/institute/verify/${code}`);
      if (res.data.success) {
        setJoinedInstituteName(res.data.data.name);
      }
    } catch {
      setJoinedInstituteName('');
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
    
    if (accountType === 'institute') {
      if (!formData.instituteName || !formData.instituteCode) {
        CustomToast.error('Please provide Institute Name and Code.');
        return;
      }
      // If institute, proceed to submit immediately
      handleSubmit(new Event('submit'));
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);

    try {
      let endpoint = `${API_URL}/api/register`;
      let payload = {};

      if (accountType === 'student' || accountType === 'teacher') {
        if (formData.instituteCode) {
           if (accountType === 'student' && (!formData.batchYear || !formData.division)) {
             setLoading(false);
             CustomToast.error('Batch Year and Department are required to join an institute.');
             return;
           }
           if (accountType === 'teacher' && !formData.division) {
             setLoading(false);
             CustomToast.error('Department is required to join an institute.');
             return;
           }
        }

        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: accountType,
          instituteCode: formData.instituteCode || undefined,
          batchYear: formData.batchYear || undefined,
          division: formData.division || undefined,
        };
      } else {
        endpoint = `${API_URL}/api/register-institute`;
        payload = {
          instituteName: formData.instituteName,
          instituteCode: formData.instituteCode,
          adminEmail: formData.email,
          adminName: formData.name,
          adminPassword: formData.password
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        CustomToast.success('Welcome to Blackitab! Account created successfully.');
        if (onSignupSuccess) onSignupSuccess(data.user, data.token);
        
        if (accountType === 'institute') {
          navigate('/institute/dashboard');
        } else {
          navigate('/onboarding');
        }
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

  /**
   * Google OAuth logic for Signup
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

        CustomToast.success(`Welcome to Blackitab, ${data.user.name}!`);
        if (onSignupSuccess) onSignupSuccess(data.user, data.token);

        navigate('/onboarding');
      } else {
        CustomToast.error(data.message || 'Google Sign-Up failed.');
      }
    } catch (err) {
      CustomToast.error('Network error. Unable to reach the servers.');
      console.error('Google Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password.length >= 6;
  const passwordsMatch = formData.password && (formData.password === formData.confirmPassword);
  
  const toggleAccountType = (type) => {
    setAccountType(type);
    setStep(1); // Reset step
    setFormData({
      name: '', email: '', password: '', confirmPassword: '',
      instituteCode: '', batchYear: '', division: '', instituteName: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white relative overflow-hidden font-sans p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />
      <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <motion.div animate={{ y: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />

      {/* Main Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/10 mt-8 mb-8">

        {/* Account Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-6 mt-2 relative">
           <div 
             className={`absolute inset-y-1 ${
               accountType === 'student' ? 'left-1 w-[calc(33.333%-0.3rem)]' : 
               accountType === 'teacher' ? 'left-[calc(33.333%+0.15rem)] w-[calc(33.333%-0.3rem)]' : 
               'left-[calc(66.666%+0.15rem)] w-[calc(33.333%-0.4rem)]'
             } bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all duration-300 ease-in-out`}
           />
           <button 
             type="button"
             onClick={() => toggleAccountType('student')}
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold relative z-10 transition-colors ${accountType === 'student' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
             <GraduationCap className="w-4 h-4" /> Student
           </button>
           <button 
             type="button"
             onClick={() => toggleAccountType('teacher')}
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold relative z-10 transition-colors ${accountType === 'teacher' ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
             <BookOpen className="w-4 h-4" /> Teacher
           </button>
           <button 
             type="button"
             onClick={() => toggleAccountType('institute')}
             className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold relative z-10 transition-colors ${accountType === 'institute' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
           >
             <Building className="w-4 h-4" /> Institute
           </button>
        </div>

        {/* Step indicator (Only for student/teacher) */}
        {(accountType === 'student' || accountType === 'teacher') && (
          <div className="flex gap-2 mb-6 justify-center">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-emerald-500' : 'w-6 bg-emerald-500/40'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-emerald-500' : 'w-6 bg-gray-200 dark:bg-white/10'}`} />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br border flex items-center justify-center shadow-inner relative overflow-hidden ${
              accountType === 'student' ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' : 
              accountType === 'teacher' ? 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' :
              'from-purple-500/10 to-pink-500/10 border-purple-500/20'
            } dark:from-white/5 dark:to-white/10 dark:border-white/10`}>
            
            {/* The icon */}
            {accountType === 'student' && step === 1 ? <User className="w-8 h-8 text-emerald-500 dark:text-emerald-400" /> : 
             accountType === 'student' && step === 2 ? <GraduationCap className="w-8 h-8 text-emerald-500 dark:text-emerald-400" /> :
             accountType === 'teacher' && step === 1 ? <User className="w-8 h-8 text-cyan-500 dark:text-cyan-400" /> :
             accountType === 'teacher' && step === 2 ? <BookOpen className="w-8 h-8 text-cyan-500 dark:text-cyan-400" /> :
             <Building className="w-8 h-8 text-purple-500 dark:text-purple-400" />}
          </motion.div>
          
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
            {accountType === 'institute' 
               ? 'Register Institute'
               : (step === 1 ? 'Create Account' : 'Join Your Institute')} 
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {accountType === 'institute' 
               ? 'Setup a workspace for your institution.'
               : (step === 1 ? `Join as a ${accountType} on Blackitab.` : 'Link your institute (optional).')} 
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {/* STEP 1: Personal Details OR Institute Admin Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-5">
                
                {/* Institute Specific Fields */}
                {accountType === 'institute' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Institute Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Building className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange} required placeholder="e.g. Pune Institute of Tech"
                          className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Unique Institute Code</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange} required placeholder="e.g. PICT2025"
                          className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner uppercase" />
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-3">Admin Details</p>
                    </div>
                  </>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                    {accountType === 'institute' ? 'Admin Full Name' : 'Full Name'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors ${
                        accountType === 'institute' ? 'group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400' : 
                        accountType === 'teacher' ? 'group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400' :
                        'group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400'
                      }`} />
                    </div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner ${
                        accountType === 'institute' ? 'focus:ring-purple-500/50' : 
                        accountType === 'teacher' ? 'focus:ring-cyan-500/50' :
                        'focus:ring-emerald-500/50'
                      }`} />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors ${
                        accountType === 'institute' ? 'group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400' : 
                        accountType === 'teacher' ? 'group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400' :
                        'group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400'
                      }`} />
                    </div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@domain.com"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner ${
                        accountType === 'institute' ? 'focus:ring-purple-500/50' : 
                        accountType === 'teacher' ? 'focus:ring-cyan-500/50' :
                        'focus:ring-emerald-500/50'
                      }`} />
                  </div>
                </div>

                {/* Password  Fields Block */}
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 transition-colors ${
                          passwordStrength ? (
                            accountType === 'institute' ? 'text-purple-500 dark:text-purple-400' : 
                            accountType === 'teacher' ? 'text-cyan-500 dark:text-cyan-400' :
                            'text-emerald-500 dark:text-emerald-400'
                          ) : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters"
                        className={`w-full pl-12 pr-12 py-3 bg-gray-100/50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner ${
                          formData.password && !passwordStrength ? 'border-red-500/50' : `border-gray-200 dark:border-white/10 focus:ring-2 ${
                            accountType === 'institute' ? 'focus:ring-purple-500/50' : 
                            accountType === 'teacher' ? 'focus:ring-cyan-500/50' :
                            'focus:ring-emerald-500/50'
                          }`
                        }`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition-colors" tabIndex="-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 transition-colors ${
                          passwordsMatch ? (
                            accountType === 'institute' ? 'text-purple-500 dark:text-purple-400' : 
                            accountType === 'teacher' ? 'text-cyan-500 dark:text-cyan-400' :
                            'text-emerald-500 dark:text-emerald-400'
                          ) : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                      <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter password"
                        className={`w-full pl-12 pr-12 py-3 bg-gray-100/50 dark:bg-white/5 border rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner ${
                          formData.confirmPassword && !passwordsMatch ? 'border-red-500/50' : `border-gray-200 dark:border-white/10 focus:ring-2 ${
                            accountType === 'institute' ? 'focus:ring-purple-500/50' : 
                            accountType === 'teacher' ? 'focus:ring-cyan-500/50' :
                            'focus:ring-emerald-500/50'
                          }`
                        }`} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white transition-colors" tabIndex="-1">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className={`group w-full rounded-xl text-white font-bold py-3.5 px-6 transition-all flex items-center justify-center gap-2 ${
                      accountType === 'institute' ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]' : 
                      accountType === 'teacher' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.3)]' :
                      'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}>
                    {loading && accountType === 'institute' ? (
                      <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Registering...</span></>
                    ) : (
                      <>
                        <span>{accountType === 'institute' ? 'Register Institute' : 'Continue'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Institute (Optional) FOR STUDENTS/TEACHERS */}
          {step === 2 && (accountType === 'student' || accountType === 'teacher') && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                {/* Role Indicator — Student / Teacher */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                  accountType === 'student' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' :
                  'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20'
                }`}>
                  {accountType === 'student' ? (
                    <GraduationCap className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-cyan-500 dark:text-cyan-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-gray-900 dark:text-white font-bold text-sm">
                      Joining as {accountType === 'student' ? 'Student' : 'Teacher'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px]">
                      {accountType === 'student' ? 'HODs & admins are promoted internally by their institute' :
                       'You can link your institute now or later in settings'}
                    </p>
                  </div>
                </div>

                {/* Institute Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Institute Code (Optional)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors ${
                        accountType === 'teacher' ? 'group-focus-within:text-cyan-500 dark:group-focus-within:text-cyan-400' :
                        'group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400'
                      }`} />
                    </div>
                    <input type="text" name="instituteCode" value={formData.instituteCode}
                      onChange={(e) => { handleChange(e); verifyInstituteCode(e.target.value); }}
                      placeholder="e.g. PICT2024 — leave empty if independent"
                      className={`w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all shadow-inner uppercase ${
                        accountType === 'teacher' ? 'focus:ring-cyan-500/50' : 'focus:ring-emerald-500/50'
                      }`} />
                  </div>
                  {verifyingCode && <p className="text-xs text-gray-500 ml-1">Verifying...</p>}
                  {joinedInstituteName && <p className="text-xs text-emerald-400 ml-1 font-medium">✓ {joinedInstituteName}</p>}
                  {formData.instituteCode && !joinedInstituteName && !verifyingCode && <p className="text-xs text-red-400 ml-1">Institute not found</p>}
                </div>

                {/* Batch & Division */}
                {joinedInstituteName && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`grid ${accountType === 'student' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                    {accountType === 'student' && (
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Batch Year</label>
                        <input type="text" name="batchYear" value={formData.batchYear} onChange={handleChange}
                          placeholder="e.g. 2025"
                          className="w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none shadow-inner focus:ring-emerald-500/50" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                        Department
                      </label>
                      <input type="text" name="division" value={formData.division} onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        className={`w-full px-4 py-3 bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 outline-none shadow-inner ${
                          accountType === 'teacher' ? 'focus:ring-cyan-500/50' : 'focus:ring-emerald-500/50'
                        }`} />
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className={`group w-full rounded-xl text-white font-bold py-3.5 px-6 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 ${
                      accountType === 'teacher' ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.3)]' :
                      'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}>
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /><span>Processing...</span></>
                    ) : (
                      <><span>Create Account</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </motion.button>
                  <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
                    ← Back to details
                  </button>
                </div>
              </form>

              {/* Google Auth Divider & Button */}
              {accountType !== 'institute' && (
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
                      onError={() => CustomToast.error('Google Sign-Up was unsuccessful')}
                      useOneTap
                      theme="filled_blue"
                      shape="pill"
                      size="large"
                      text="signup_with"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-200 dark:border-white/10 pt-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className={`font-semibold transition-colors ${accountType === 'institute' ? 'text-purple-500 hover:text-purple-400 dark:text-purple-400 dark:hover:text-purple-300' : 'text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300'}`}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
