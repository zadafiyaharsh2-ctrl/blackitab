import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }

    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Ambient Background */}
      <div className="login-bg-base" />
      <div className="login-orb login-orb--blue" />
      <div className="login-orb login-orb--purple" />
      <div className="login-grid-overlay" />

      {/* Floating particles */}
      <div className="login-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="login-particle" style={{ '--i': i }} />
        ))}
      </div>

      {/* Card */}
      <div className="login-card">
        {/* Header */}
        <div className="login-header login-step-enter">
          <div className="login-icon-circle">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue to Blackitab</p>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="login-form login-step-enter">
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="login-input-wrap">
              <svg className="login-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="login-input-icon"
                style={{ left: 'auto', right: '14px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <a href="/forgot-password" className="login-link" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? (
              <>
                <div className="login-spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg className="login-btn-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="login-link">Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        /* ===== LOGIN PAGE STYLES ===== */
        .login-page {
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

        /* Background layers */
        .login-bg-base {
          position: fixed;
          inset: 0;
          background: linear-gradient(to bottom, #0a0a1a, #000 40%, #050510);
          z-index: 0;
        }

        .login-orb {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(140px);
          pointer-events: none;
          mix-blend-mode: screen;
          animation: orbFloat 8s ease-in-out infinite alternate;
        }

        .login-orb--blue {
          top: -25%;
          left: -15%;
          background: rgba(59, 130, 246, 0.15);
          animation-delay: 0s;
        }

        .login-orb--purple {
          bottom: -25%;
          right: -15%;
          background: rgba(139, 92, 246, 0.12);
          animation-delay: -4s;
        }

        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }

        .login-grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.06;
          background-image:
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* Floating particles */
        .login-particles {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }

        .login-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(147, 197, 253, 0.4);
          border-radius: 50%;
          animation: particleDrift 12s ease-in-out infinite;
          left: calc(15% + var(--i) * 13%);
          top: calc(20% + var(--i) * 10%);
          animation-delay: calc(var(--i) * -2s);
        }

        @keyframes particleDrift {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(20px, -30px); opacity: 0.7; }
          50% { transform: translate(-10px, -60px); opacity: 0.4; }
          75% { transform: translate(15px, -20px); opacity: 0.6; }
        }

        /* Card */
        .login-card {
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
            0 0 80px rgba(59, 130, 246, 0.05);
          animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(24px);
        }

        @keyframes cardAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15));
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #93c5fd;
        }

        .login-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem;
          background: linear-gradient(to right, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: rgba(148, 163, 184, 0.8);
          margin: 0;
          line-height: 1.5;
        }

        /* Step transitions */
        .login-step-enter {
          animation: stepEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes stepEnter {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Form fields */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(203, 213, 225, 0.7);
          margin-bottom: 0.5rem;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input-icon {
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

        .login-input-wrap input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
        }

        .login-input-wrap input::placeholder {
          color: rgba(148, 163, 184, 0.35);
        }

        .login-input-wrap input:focus {
          border-color: rgba(59, 130, 246, 0.5);
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .login-input-wrap:focus-within .login-input-icon {
          color: #93c5fd;
        }

        /* Error */
        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #fca5a5;
          font-size: 0.85rem;
          animation: errorShake 0.4s ease-out;
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }

        /* Button */
        .login-btn {
          width: 100%;
          padding: 0.9rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          margin-top: 0.5rem;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.35);
        }

        .login-btn:hover::before {
          opacity: 1;
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-btn-arrow {
          width: 18px;
          height: 18px;
          transition: transform 0.3s;
        }

        .login-btn:hover .login-btn-arrow {
          transform: translateX(4px);
        }

        /* Spinner */
        .login-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 1.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .login-footer p {
          font-size: 0.85rem;
          color: rgba(148, 163, 184, 0.6);
          margin: 0;
        }

        .login-link {
          color: #93c5fd;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .login-link:hover {
          color: #bfdbfe;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .login-card {
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          .login-title {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
