import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postsAPI } from '../api';
import { ArrowLeft, Clock, Heart, Share2, Bookmark, Check, Calendar, User } from 'lucide-react';

export default function PostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive micro-interactions
  const [claps, setClaps] = useState(12);
  const [hasClapped, setHasClapped] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsAPI.getBySlug(slug);
      if (data.success && data.post) {
        setPost(data.post);
      } else {
        setError('This story could not be found or is currently private.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Story not found or network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Simple Markdown Parser to render Medium-like typography safely
  const renderMarkdownContent = (content = '') => {
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];

    lines.forEach((line, index) => {
      // Code block start / end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`}>
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        elements.push(<h2 key={index}>{trimmed.replace('# ', '')}</h2>);
      }
      // Heading 2
      else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={index}>{trimmed.replace('## ', '')}</h2>);
      }
      // Heading 3
      else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={index}>{trimmed.replace('### ', '')}</h3>);
      }
      // Blockquote
      else if (trimmed.startsWith('> ')) {
        elements.push(<blockquote key={index}>{trimmed.replace('> ', '')}</blockquote>);
      }
      // Bullet list item
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <ul key={index}>
            <li>{trimmed.substring(2)}</li>
          </ul>
        );
      }
      // Numbered list item
      else if (/^\d+\.\s/.test(trimmed)) {
        elements.push(
          <ol key={index}>
            <li>{trimmed.replace(/^\d+\.\s/, '')}</li>
          </ol>
        );
      }
      // Images in markdown: ![alt](url)
      else if (trimmed.startsWith('![') && trimmed.includes('](')) {
        const altMatch = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
        if (altMatch) {
          elements.push(
            <div key={index} style={{ textAlign: 'center', margin: '32px 0' }}>
              <img src={altMatch[2]} alt={altMatch[1]} style={{ maxWidth: '100%', borderRadius: '16px' }} />
              {altMatch[1] && <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', marginTop: '8px' }}>{altMatch[1]}</div>}
            </div>
          );
        }
      }
      // Non-empty paragraph
      else if (trimmed.length > 0) {
        elements.push(<p key={index}>{line}</p>);
      }
    });

    return elements;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--text-subtle)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📖</div>
        <p style={{ fontWeight: '500' }}>Preparing story for distraction-free reading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍃</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '12px' }}>Story Not Available</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error || 'This post could not be retrieved.'}</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Reading Navigation Bar */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(250, 247, 242, 0.75)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: '73px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '740px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <ArrowLeft size={16} />
            <span>All Stories</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
              <Clock size={13} />
              <span>{post.reading_time_minutes || 3} min read</span>
            </span>

            <button
              onClick={handleShare}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}
            >
              {copied ? <Check size={14} color="#2E7D32" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Distraction-Free Article Container */}
      <article className="article-container">
        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {post.tags.map((tag, idx) => (
              <span key={idx} className="badge badge-pink" style={{ textTransform: 'capitalize' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="article-title">{post.title}</h1>

        {/* Excerpt / Subheading */}
        {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}

        {/* Author Byline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '16px 0 28px',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '36px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-pink-soft)',
            border: '2px solid var(--pastel-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--pastel-pink-text)'
          }}>
            {post.author_username ? post.author_username.charAt(0).toUpperCase() : '🌸'}
          </div>

          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{post.author_username || 'Staff Author'}</span>
              <span className="badge badge-mint" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>Author</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <Calendar size={13} />
              <span>{formatDate(post.created_at)}</span>
              <span>•</span>
              <Clock size={13} />
              <span>{post.reading_time_minutes || 3} min read</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div style={{ marginBottom: '40px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <img
              src={post.featured_image_url}
              alt={post.title}
              style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Body Text */}
        <div className="article-body">
          {renderMarkdownContent(post.content)}
        </div>

        {/* Bottom Interactive Engagement Bar */}
        <div style={{
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Heart / Clap Micro-Interaction */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleClap}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: hasClapped ? 'var(--pastel-pink)' : 'var(--bg-card)',
                color: hasClapped ? 'var(--pastel-pink-text)' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: hasClapped ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <Heart size={18} fill={hasClapped ? 'currentColor' : 'none'} color={hasClapped ? 'var(--pastel-pink-text)' : '#E2799F'} />
              <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>{claps}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>applause</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handleShare} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
              <Share2 size={15} />
              <span>{copied ? 'Link Copied!' : 'Share Story'}</span>
            </button>

            <Link to="/" className="btn-primary" style={{ fontSize: '0.85rem' }}>
              <ArrowLeft size={15} />
              <span>More Stories</span>
            </Link>
          </div>
        </div>

        {/* Author Bio Box */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--pastel-lavender-soft)',
            border: '2px solid var(--pastel-lavender)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            🌸
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Written by {post.author_username || 'Staff Author'}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Exploring humanized software, aesthetic calm, and production resilience. Thank you for reading with an open heart.
            </p>
          </div>
        </div>

      </article>
    </div>
  );
}
