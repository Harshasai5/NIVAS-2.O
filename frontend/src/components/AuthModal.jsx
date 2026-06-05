import React, { useState, useEffect } from 'react';
import { User, UserPlus, X, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError('');
      setMessage('');
    }
  }, [isOpen, initialTab]);
  
  // Login form state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !loginPassword) {
      setError('Please enter all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password: loginPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userUsername', data.user.username);
      
      onLoginSuccess(data.token, data.user.email, data.user.username);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !registerPassword) {
      setError('Please enter all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (registerPassword.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password: registerPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userUsername', data.user.username);
      
      onLoginSuccess(data.token, data.user.email, data.user.username);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setMessage('');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999999,
      animation: 'fadeIn 0.25s ease-out',
      padding: '1rem'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: '#ffffff',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: '#0f172a'
      }}>
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            {activeTab === 'login' ? <User size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            {activeTab === 'login' ? 'Login' : 'Register Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.4' }}>
            {activeTab === 'login' 
              ? 'Please log in to your account to continue.' 
              : 'Create a new account to like or share.'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #dcfce7',
            color: '#22c55e',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {message}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="login-identifier" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Username or Email
              </label>
              <input
                id="login-identifier"
                type="text"
                required
                placeholder="username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="nav-button"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} />
                  Logging in...
                </>
              ) : 'Login'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <span 
                onClick={() => switchTab('register')} 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
              >
                Register here
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="register-username" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                id="register-username"
                type="text"
                required
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                id="register-password"
                type="password"
                required
                placeholder="•••••••• (Min 5 chars)"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="nav-button"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ marginRight: '0.5rem' }} />
                  Creating account...
                </>
              ) : 'Register'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <span 
                onClick={() => switchTab('login')} 
                style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
              >
                Login here
              </span>
            </div>
          </form>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
