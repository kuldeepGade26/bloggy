import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Feather, BookOpen, PenTool, LogIn, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout, openAuthModal } = useAuth();
  const location = useLocation();

  return (
    <header className="glass-nav">
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--pastel-pink-soft)',
            border: '1px solid var(--pastel-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            🌸
          </div>
          <div>
            <span style={{ fontSize: '1.28rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', display: 'block', lineHeight: 1.1 }}>
              bloggy
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: '500', letterSpacing: '0.04em' }}>
              gentle thoughts & code
            </span>
          </div>
        </Link>

        {/* Navigation links & User actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/' ? '700' : '500',
              color: location.pathname === '/' ? 'var(--text-main)' : 'var(--text-muted)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: location.pathname === '/' ? 'var(--bg-subtle)' : 'transparent',
              transition: 'var(--transition-smooth)'
            }}
          >
            <BookOpen size={16} />
            <span>Stories</span>
          </Link>

          {/* Admin Studio Link */}
          <Link
            to="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: location.pathname.startsWith('/admin') ? '700' : '500',
              color: location.pathname.startsWith('/admin') ? 'var(--pastel-pink-text)' : 'var(--text-muted)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: location.pathname.startsWith('/admin') ? 'var(--pastel-pink-soft)' : 'transparent',
              transition: 'var(--transition-smooth)'
            }}
          >
            <PenTool size={16} />
            <span>Admin Studio</span>
            {isAdmin && <span className="badge badge-pink" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>Admin</span>}
          </Link>

          {/* User state display */}
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px 5px 6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: user.role === 'admin' ? 'var(--pastel-lavender)' : 'var(--pastel-mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: user.role === 'admin' ? 'var(--pastel-lavender-text)' : 'var(--pastel-mint-text)'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="btn-secondary"
                style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
              >
                <LogOut size={16} color="var(--text-muted)" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => openAuthModal('login')}
                className="btn-secondary"
                style={{ fontSize: '0.88rem', padding: '8px 16px' }}
              >
                <LogIn size={15} />
                <span>Sign in</span>
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="btn-primary"
                style={{ fontSize: '0.88rem', padding: '8px 18px', backgroundColor: 'var(--text-main)' }}
              >
                <Sparkles size={15} color="var(--pastel-pink)" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
