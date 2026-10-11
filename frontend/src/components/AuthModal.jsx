import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const identifier = email || username;
        if (!identifier || !password) {
          setError('Please fill in both your email/username and password.');
          setLoading(false);
          return;
        }
        await login(identifier, password);
        setSuccess('Logged in happily! Welcome back.');
      } else {
        if (!username || !email || !password) {
          setError('Please fill in username, email, and password.');
          setLoading(false);
          return;
        }
        await register(username, email, password);
        setSuccess('Welcome to the Bloggy family! Account created.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication error. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setEmail('admin@bloggy.local');
      setUsername('cherryblossom');
      setPassword('adminpassword123');
      setAuthModalMode('login');
    } else {
      setEmail('reader@bloggy.local');
      setUsername('mochi_reader');
      setPassword('adminpassword123');
      setAuthModalMode('login');
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: 'var(--pastel-pink-soft)',
            fontSize: '1.5rem',
            marginBottom: '12px'
          }}>
            🌸
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {authModalMode === 'login' ? 'Welcome Back, Friend' : 'Join the Cozy Circle'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {authModalMode === 'login'
              ? 'Sign in to bookmark, write, and enjoy stories.'
              : 'Sign up with only username, email & password.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setAuthModalMode('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: authModalMode === 'login' ? '700' : '500',
              backgroundColor: authModalMode === 'login' ? 'var(--bg-card)' : 'transparent',
              color: authModalMode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: authModalMode === 'login' ? 'var(--shadow-subtle)' : 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthModalMode('register'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: authModalMode === 'register' ? '700' : '500',
              backgroundColor: authModalMode === 'register' ? 'var(--bg-card)' : 'transparent',
              color: authModalMode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: authModalMode === 'register' ? 'var(--shadow-subtle)' : 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            color: '#C62828',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#E8F5E9',
            border: '1px solid #C8E6C9',
            color: '#2E7D32',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {authModalMode === 'register' && (
            <div>
              <label className="input-label">Username</label>
              <input
                type="text"
                placeholder="e.g. honeydew"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                required
              />
            </div>
          )}

          <div>
            <label className="input-label">{authModalMode === 'login' ? 'Email or Username' : 'Email Address'}</label>
            <input
              type={authModalMode === 'login' ? 'text' : 'email'}
              placeholder={authModalMode === 'login' ? 'admin@bloggy.local or username' : 'name@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? (
              'Brewing your credentials...'
            ) : authModalMode === 'login' ? (
              <>
                <LogIn size={16} />
                <span>Sign In to Bloggy</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Reader Account</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demos */}
        <div style={{ marginTop: '22px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textAlign: 'center', marginBottom: '8px', fontWeight: '600' }}>
            ✨ QUICK DEMO ACCOUNTS (ONE CLICK):
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px', justifyContent: 'center' }}
            >
              🌸 Admin (Editor)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('reader')}
              className="btn-secondary"
              style={{ flex: 1, fontSize: '0.78rem', padding: '6px 10px', justifyContent: 'center' }}
            >
              ☕ Reader
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
