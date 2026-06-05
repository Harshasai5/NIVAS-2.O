import React, { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function UserRegister({ onLoginSuccess, navigateTo }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Save token and info
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userUsername', data.user.username);
      
      onLoginSuccess(data.token, data.user.email, data.user.username);
      navigateTo('/home', 'home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container animate-fade" style={{ minHeight: 'calc(100vh - 140px)', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Back to Home Button */}
      <button
        onClick={() => navigateTo('/home', 'home')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'color 0.2s',
          fontSize: '0.9rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </button>

      <div className="admin-login-card glass" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 2rem', background: '#ffffff', color: '#0f172a', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={28} />
          </div>
        </div>

        <h2 className="admin-login-title" style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginTop: '0', marginBottom: '2rem', lineHeight: '1.4' }}>
          Sign up to customize your experience, like, and share hostels and PG rooms
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 500 }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="choose a username"
              className="form-input"
              required
              style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="form-input"
              required
              style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (Min 5 chars)"
              className="form-input"
              required
              style={{ width: '100%', background: '#f8fafc', borderColor: 'var(--border)', color: '#0f172a' }}
            />
          </div>

          <button 
            type="submit" 
            className="nav-button" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontWeight: 700 }}
          >
            <UserPlus size={18} style={{ marginRight: '0.5rem' }} />
            <span>{loading ? 'Creating account...' : 'Register'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => navigateTo('/login', 'login')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}
