import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
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
        if (onSignupSuccess) onSignupSuccess(data.user, data.token);
        // Send new users through onboarding
        navigate('/onboarding');
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

  const passwordStrength = formData.password.length >= 6;
  const passwordsMatch = formData.password === formData.confirmPassword;

  return (
    <div className="signup-page">
      {/* Ambient Background */}
      <div className="signup-bg-base" />
      <div className="signup-orb signup-orb--emerald" />
      <div className="signup-orb signup-orb--violet" />
      <div className="signup-grid-overlay" />

      {/* Floating particles */}
      <div className="signup-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="signup-particle" style={{ '--i': i }} />
        ))}
      </div>

      {/* Card */}
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header signup-step-enter">
          <div className="signup-icon-circle">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join Blackitab and start learning</p>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="signup-form signup-step-enter">
          <div className="signup-field">
            <label htmlFor="name">Full Name</label>
            <div className="signup-input-wrap">
              <svg className="signup-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="email">Email</label>
            <div className="signup-input-wrap">
              <svg className="signup-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="password">Password</label>
            <div className="signup-input-wrap">
              <svg className="signup-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="signup-input-icon"
                style={{ left: 'auto', right: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {formData.password && (
              <span className={`signup-hint ${passwordStrength ? 'good' : 'warn'}`}>
                {passwordStrength ? '✓ Strong enough' : `${formData.password.length}/6 characters`}
              </span>
            )}
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={`signup-input-wrap ${formData.confirmPassword ? (passwordsMatch ? 'match' : 'mismatch') : ''}`}>
              <svg className="signup-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(p => !p)}
                className="signup-input-icon"
                style={{ left: 'auto', right: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '🙈' : '👁'}
              </button>
            </div>
            {formData.confirmPassword && (
              <span className={`signup-hint ${passwordsMatch ? 'good' : 'warn'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords don\'t match'}
              </span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="signup-error">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="signup-btn">
            {loading ? (
              <>
                <div className="signup-spinner" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <svg className="signup-btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="signup-link">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          overflow: hidden;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          padding: 1.5rem;
        }

        .signup-bg-base {
          position: fixed;
          inset: 0;
          background: linear-gradient(to bottom, #0a0a1a, #000 40%, #050510);
          z-index: 0;
        }

        .signup-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          mix-blend-mode: screen;
          animation: signupOrbFloat 8s ease-in-out infinite alternate;
        }

        .signup-orb--emerald {
          top: -25%;
          left: -15%;
          background: rgba(16, 185, 129, 0.12);
          animation-delay: 0s;
        }

        .signup-orb--violet {
          bottom: -25%;
          right: -15%;
          background: rgba(139, 92, 246, 0.12);
          animation-delay: -4s;
        }

        @keyframes signupOrbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }

        .signup-grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.06;
          background-image:
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .signup-particles {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .signup-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(110, 231, 183, 0.4);
          border-radius: 50%;
          animation: signupParticleDrift 12s ease-in-out infinite;
          left: calc(15% + var(--i) * 13%);
          top: calc(20% + var(--i) * 10%);
          animation-delay: calc(var(--i) * -2s);
        }

        @keyframes signupParticleDrift {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(20px, -30px); opacity: 0.7; }
          50% { transform: translate(-10px, -60px); opacity: 0.4; }
          75% { transform: translate(15px, -20px); opacity: 0.6; }
        }

        .signup-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          background: rgba(15, 15, 30, 0.7);
          backdrop-filter: blur(24px) saturate(1.5);
          -webkit-backdrop-filter: blur(24px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.03),
            0 24px 48px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(16, 185, 129, 0.05);
          animation: signupCardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(24px);
        }

        @keyframes signupCardAppear {
          to { opacity: 1; transform: translateY(0); }
        }


        .signup-header { text-align: center; margin-bottom: 2rem; }

        .signup-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(139, 92, 246, 0.15));
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #6ee7b7;
        }

        .signup-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem;
          background: linear-gradient(to right, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .signup-subtitle {
          font-size: 0.875rem;
          color: rgba(148, 163, 184, 0.8);
          margin: 0;
          line-height: 1.5;
        }

        .signup-step-enter {
          animation: signupStepEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes signupStepEnter {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .signup-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(203, 213, 225, 0.7);
          margin-bottom: 0.5rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .signup-input-wrap {
          position: relative;
        }

        .signup-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: rgba(148, 163, 184, 0.5);
          transition: color 0.2s;
          pointer-events: none;
        }

        .signup-input-wrap input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .signup-input-wrap input::placeholder {
          color: rgba(148, 163, 184, 0.35);
        }

        .signup-input-wrap input:focus {
          border-color: rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.05);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .signup-input-wrap:focus-within .signup-input-icon {
          color: #6ee7b7;
        }

        .signup-input-wrap.match input {
          border-color: rgba(16, 185, 129, 0.4);
        }

        .signup-input-wrap.mismatch input {
          border-color: rgba(239, 68, 68, 0.4);
        }

        .signup-hint {
          display: block;
          font-size: 0.75rem;
          margin-top: 0.35rem;
          padding-left: 0.25rem;
          transition: color 0.2s;
        }

        .signup-hint.good { color: #6ee7b7; }
        .signup-hint.warn { color: #fca5a5; }



        .signup-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.85rem;
          animation: signupErrorShake 0.4s ease-out;
        }

        @keyframes signupErrorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        .signup-btn {
          width: 100%;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .signup-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .signup-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
        }

        .signup-btn:hover::before { opacity: 1; }

        .signup-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .signup-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-btn-arrow {
          width: 18px;
          height: 18px;
          transition: transform 0.3s;
        }

        .signup-btn:hover .signup-btn-arrow {
          transform: translateX(4px);
        }

        .signup-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: signupSpin 0.6s linear infinite;
        }

        @keyframes signupSpin { to { transform: rotate(360deg); } }

        .signup-footer {
          text-align: center;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .signup-footer p {
          font-size: 0.85rem;
          color: rgba(148, 163, 184, 0.6);
          margin: 0;
        }

        .signup-link {
          color: #6ee7b7;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .signup-link:hover { color: #a7f3d0; }

        @media (max-width: 480px) {
          .signup-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          .signup-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
};

export default Signup;
