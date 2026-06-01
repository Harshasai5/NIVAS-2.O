import React, { useState } from 'react';
import { ShieldPlus, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AdminRegister({ navigateTo }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await fetch(`${API_BASE_URL}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess('Administrator registered successfully! Directing you to login...');
      setTimeout(() => {
        navigateTo('/admin-login', 'admin-login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container animate-fade">
      <div className="admin-login-card glass">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldPlus size={28} />
          </div>
        </div>

        <h2 className="admin-login-title">Register Administrator</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem' }}>
          Create a secure administrator credential to manage your finder assets.
        </p>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--girls-color)', color: 'var(--girls-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--unisex-color)', color: 'var(--unisex-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. nivas_owner"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Create Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 5 characters"
              className="form-input"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            className="action-btn action-btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Registering...' : 'Register Account'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => navigateTo('/admin-login', 'admin-login')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In here
          </span>
        </div>
      </div>
    </div>
  );
}
