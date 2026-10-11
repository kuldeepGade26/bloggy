import React from 'react';
import { Heart, Terminal, Database, Server } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      padding: '48px 24px 36px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🌸</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>bloggy</span>
          <span style={{ color: 'var(--text-subtle)' }}>•</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>A minimalist & adorable reading haven</span>
        </div>

        {/* Tech Stack Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          <span className="badge badge-pink">
            <Heart size={12} fill="currentColor" /> React + Vite
          </span>
          <span className="badge badge-mint">
            <Server size={12} /> Node.js & Express
          </span>
          <span className="badge badge-lavender">
            <Database size={12} /> PostgreSQL
          </span>
          <span className="badge badge-peach">
            <Terminal size={12} /> Apache2 & PM2 Ready
          </span>
        </div>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', maxWidth: '520px', lineHeight: 1.6 }}>
          Crafted with care, gentle aesthetics, and resilient systems. Ready to deploy behind an Apache2 reverse proxy on Linux.
        </p>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
          © {new Date().getFullYear()} Bloggy. All thoughts and cozy musings preserved.
        </div>
      </div>
    </footer>
  );
}
