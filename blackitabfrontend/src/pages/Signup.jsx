/**
 * ============================================================================
 * SIGNUP PAGE COMPONENT (Signup.jsx)
 * ============================================================================
 * 
 * Handles new user registration.
 * 1. Collect Details (Name, Email, Password) -> Create User
 * 2. Backend returns JWT token -> Auto-login and redirect to Dashboard
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';  // Ensure we use the centralized API URL

const Signup = ({ onSignupSuccess }) => {
  const navigate = useNavigate();

  // Local State structure
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  /**
   * Handle Form Submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Client-side Validation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      console.log('Sending register request...');
      
      // POST request to create user
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
        // Save JWT Token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (onSignupSuccess) {
          onSignupSuccess(data.user, data.token);
        }
        
        navigate('/dashboard');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white overflow-hidden relative selection:bg-blue-500 selection:text-white font-sans px-4 py-12">
      
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      {/* 1. Base Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-0"></div>
      
      {/* 2. Animated Glow Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen"></div>

      {/* 3. Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.15]" 
           style={{ 
             backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', 
             backgroundSize: '50px 50px' 
           }}>
      </div>

      <div className="relative z-10 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 hover:shadow-3xl hover:border-blue-500/30 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm">
            Sign up to get started
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-300">Full Name</label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 pl-12 bg-gray-900/50 border-2 border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 pl-12 bg-gray-900/50 border-2 border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          {/* Password Field with Indicator */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-300">Password</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 pl-12 bg-gray-900/50 border-2 border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            {/* Real-time Password Strength feedback */}
            {formData.password && (
              <p className={`text-xs ${formData.password.length >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                {formData.password.length >= 6 ? '✓ Password length is good' : `⚠ Password must be at least 6 characters (${formData.password.length}/6)`}
              </p>
            )}
          </div>

          {/* Confirm Password Field with Match Indicator */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 pl-12 bg-gray-900/50 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 text-white ${
                  formData.confirmPassword && formData.password === formData.confirmPassword
                    ? 'border-green-500/50 focus:ring-green-500 focus:border-transparent'
                    : formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-700 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs ${
                formData.password === formData.confirmPassword ? 'text-green-400' : 'text-red-400'
              }`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '⚠ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 rounded-r-lg text-sm flex items-center space-x-2 animate-pulse">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-600/30 hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors underline decoration-2 underline-offset-2"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation-name: fadeInUp;
          animation-duration: 0.8s;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default Signup;
