import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomToast } from '../../utils/CustomToast';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building, GraduationCap, BookOpen, Quote } from 'lucide-react';
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
        CustomToast.success('Welcome to RANKLEN! Account created successfully.');
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
          clientId: credentialResponse.clientId,
          role: accountType,
          instituteCode: formData.instituteCode,
          batchYear: formData.batchYear,
          division: formData.division
        }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        CustomToast.success(`Welcome to RANKLEN, ${data.user.name}!`);
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900 font-sans">
      
      {/* BRANDING PANE - Asymmetrical Split (Left) */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 relative bg-[#f8f9fa] border-r border-gray-200 flex-col justify-between p-12 lg:p-16 overflow-hidden">
        {/* Subtle Decorative Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,97,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -left-[20%] -top-[10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#0061FF]/5 to-transparent blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#0061FF]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">RANKLEN</span>
        </div>

        <div className="relative z-10 my-auto">
          <Quote className="w-12 h-12 text-gray-200 mb-6" />
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Architect Your <br />Scholarly Era.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-md">
            The Digital Curator. A premium, high-art environment to organize, manage, and excel in your educational journey.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium text-gray-400">
          © {new Date().getFullYear()} Ranklen. All rights reserved.
        </div>
      </div>

      {/* FORM PANE - Asymmetrical Split (Right) */}
      <div className="w-full md:w-[55%] lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-200 relative z-10 my-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {accountType === 'institute' 
                 ? 'Register Institute'
                 : (step === 1 ? 'Create Account' : 'Join Your Institute')} 
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {accountType === 'institute' 
                 ? 'Setup a prestigious workspace for your institution.'
                 : (step === 1 ? `Join as a ${accountType} on RANKLEN.` : 'Link your institute workspace (optional).')} 
            </p>
          </div>

          {/* Account Type Toggle Tabs */}
          <div className="flex bg-gray-50 border border-gray-100 rounded-xl p-1 mb-6 relative">
             <div 
               className={`absolute inset-y-1 ${
                 accountType === 'student' ? 'left-1 w-[calc(33.333%-0.3rem)]' : 
                 accountType === 'teacher' ? 'left-[calc(33.333%+0.15rem)] w-[calc(33.333%-0.3rem)]' : 
                 'left-[calc(66.666%+0.15rem)] w-[calc(33.333%-0.4rem)]'
               } bg-white rounded-lg shadow-sm border border-white transition-all duration-300 ease-in-out`}
             />
             <button type="button" onClick={() => toggleAccountType('student')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold tracking-wide relative z-10 transition-colors uppercase ${accountType === 'student' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
               <GraduationCap className="w-4 h-4" /> Student
             </button>
             <button type="button" onClick={() => toggleAccountType('teacher')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold tracking-wide relative z-10 transition-colors uppercase ${accountType === 'teacher' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
               <BookOpen className="w-4 h-4" /> Teacher
             </button>
             <button type="button" onClick={() => toggleAccountType('institute')}
               className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold tracking-wide relative z-10 transition-colors uppercase ${accountType === 'institute' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
               <Building className="w-4 h-4" /> Institute
             </button>
          </div>

          {/* Step indicator (Only for student/teacher) */}
          {(accountType === 'student' || accountType === 'teacher') && (
            <div className="flex gap-2 mb-8 mt-2 items-center justify-center sm:justify-start">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-10 bg-[#0061FF]' : 'w-6 bg-gray-200'}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-10 bg-[#0061FF]' : 'w-6 bg-gray-200'}`} />
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {/* STEP 1: Personal Details OR Institute Admin Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
                  
                  {/* Institute Specific Fields */}
                  {accountType === 'institute' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Institute Name</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Building className="w-4 h-4 text-gray-400 group-focus-within:text-[#0061FF] transition-colors" />
                          </div>
                          <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange} required placeholder="e.g. Pune Institute of Tech"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0061FF]/10 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm focus:border-[#0061FF]" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Unique Institute Code</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-[#0061FF] transition-colors" />
                          </div>
                          <input type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange} required placeholder="e.g. PICT2025"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0061FF]/10 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm focus:border-[#0061FF] uppercase" />
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4 mt-6">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-3">Admin Config</p>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                        {accountType === 'institute' ? 'Admin Full Name' : 'Full Name'}
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-gray-400 group-focus-within:text-[#0061FF] transition-colors" />
                        </div>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0061FF]/10 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm focus:border-[#0061FF]" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-[#0061FF] transition-colors" />
                        </div>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@institution.edu"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0061FF]/10 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm focus:border-[#0061FF]" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`w-4 h-4 transition-colors ${passwordStrength ? 'text-[#0061FF]' : 'text-gray-400 group-focus-within:text-[#0061FF]'}`} />
                        </div>
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 chars"
                          className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm ${
                            formData.password && !passwordStrength ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-gray-200 focus:border-[#0061FF] focus:ring-[#0061FF]/10'
                          }`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors" tabIndex="-1">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`w-4 h-4 transition-colors ${passwordsMatch ? 'text-[#0061FF]' : 'text-gray-400 group-focus-within:text-[#0061FF]'}`} />
                        </div>
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Re-enter"
                          className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm ${
                            formData.confirmPassword && !passwordsMatch ? 'border-red-400 focus:ring-red-500/10 focus:border-red-500' : 'border-gray-200 focus:border-[#0061FF] focus:ring-[#0061FF]/10'
                          }`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors" tabIndex="-1">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 text-center sm:text-left">
                    <button type="submit" disabled={loading}
                      className="w-full rounded-full text-white font-semibold py-3.5 px-6 transition-all flex items-center justify-center gap-2 bg-[#0061FF] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading && accountType === 'institute' ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Registering...</span></>
                      ) : (
                        <>
                          <span>{accountType === 'institute' ? 'Register Institute' : 'Continue Step'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Institute (Optional) FOR STUDENTS/TEACHERS */}
            {step === 2 && (accountType === 'student' || accountType === 'teacher') && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">

                  {/* Role Indicator */}
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      {accountType === 'student' ? <GraduationCap className="w-5 h-5 text-[#0061FF]" /> : <BookOpen className="w-5 h-5 text-[#0061FF]" />}
                    </div>
                    <div>
                      <p className="text-gray-900 font-bold text-sm tracking-tight">
                        Continuing as {accountType === 'student' ? 'Student' : 'Teacher'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Optional: Link directly to an institute workspace below.
                      </p>
                    </div>
                  </div>

                  {/* Institute Code */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Institute Link Code</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building className="w-5 h-5 text-gray-400 group-focus-within:text-[#0061FF] transition-colors" />
                      </div>
                      <input type="text" name="instituteCode" value={formData.instituteCode}
                        onChange={(e) => { handleChange(e); verifyInstituteCode(e.target.value); }}
                        placeholder="e.g. PICT2024"
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0061FF]/10 text-gray-900 placeholder-gray-400 outline-none transition-all shadow-sm focus:border-[#0061FF] uppercase" />
                    </div>
                    {verifyingCode && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mt-2">Verifying...</p>}
                    {joinedInstituteName && <p className="text-[10px] font-bold text-[#0061FF] uppercase tracking-widest ml-1 mt-2">✓ Connected: {joinedInstituteName}</p>}
                    {formData.instituteCode && !joinedInstituteName && !verifyingCode && <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-1 mt-2">Workspace not found</p>}
                  </div>

                  {/* Batch & Division */}
                  {joinedInstituteName && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`grid ${accountType === 'student' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-2`}>
                      {accountType === 'student' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batch Year</label>
                          <input type="text" name="batchYear" value={formData.batchYear} onChange={handleChange}
                            placeholder="e.g. 2025"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none shadow-sm focus:border-[#0061FF] focus:ring-[#0061FF]/10" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                          Department
                        </label>
                        <input type="text" name="division" value={formData.division} onChange={handleChange}
                          placeholder="e.g. Computer Science"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 text-gray-900 placeholder-gray-400 outline-none shadow-sm focus:border-[#0061FF] focus:ring-[#0061FF]/10" />
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="pt-6 space-y-4">
                    <button type="submit" disabled={loading}
                      className="w-full rounded-full text-white font-semibold py-3.5 px-6 transition-all flex items-center justify-center gap-2 bg-[#0061FF] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed">
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing...</span></>
                      ) : (
                        <><span>Complete Sign Up</span><ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="w-full text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors tracking-widest flex items-center justify-center gap-2">
                      ← GO BACK
                    </button>
                  </div>
                </form>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Auth Divider & Button - Available on all steps */}
          {accountType !== 'institute' && (
            <div className="mt-8 border-t border-gray-100 pt-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Or continue with
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
                <div className="w-full p-[1px] rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => CustomToast.error('Google Sign-Up was unsuccessful')}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    size="large"
                    text="signup_with"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center sm:text-left">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#0061FF] hover:underline transition-all">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
