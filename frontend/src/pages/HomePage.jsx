import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../api';
import { Clock, Tag, Search, Sparkles, BookOpen, ArrowRight, Compass } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const availableTags = ['all', 'cozy', 'design', 'engineering', 'mindfulness', 'lifestyle'];

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedTag && selectedTag !== 'all') {
        params.tag = selectedTag;
      }
      const data = await postsAPI.getAll(params);
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not connect to the story archive. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = post.title?.toLowerCase().includes(q);
    const excerptMatch = post.excerpt?.toLowerCase().includes(q);
    const tagMatch = post.tags?.some((t) => t.toLowerCase().includes(q));
    return titleMatch || excerptMatch || tagMatch;
  });

  const getTagBadgeClass = (index) => {
    const classes = ['badge-pink', 'badge-mint', 'badge-lavender', 'badge-peach', 'badge-butter'];
    return classes[index % classes.length];
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '80px' }}>
      {/* Adorable Hero Section */}
      <section style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '56px 24px 36px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          backgroundColor: 'var(--pastel-pink-soft)',
          border: '1px solid var(--pastel-pink)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.82rem',
          fontWeight: '700',
          color: 'var(--pastel-pink-text)',
          marginBottom: '20px'
        }}>
          <Sparkles size={14} />
          <span>A gentle, distraction-free publication</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: '800',
          lineHeight: '1.18',
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          maxWidth: '820px',
          margin: '0 auto 18px'
        }}>
          A cozy sanctuary for words, coffee, and code.
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.22rem)',
          lineHeight: '1.6',
          color: 'var(--text-muted)',
          maxWidth: '640px',
          margin: '0 auto 36px',
          fontWeight: '400'
        }}>
          Explore heartfelt reflections on engineering craftsmanship, warm pastel design, and mindful living. Built with React, Node.js, and PostgreSQL.
        </p>

        {/* Search bar */}
        <div style={{
          maxWidth: '540px',
          margin: '0 auto 28px',
          position: 'relative',
        }}>
          <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search stories, ideas, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px 14px 48px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.96rem',
              boxShadow: 'var(--shadow-card)',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
          />
        </div>

        {/* Tag Pills Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {availableTags.map((tag) => {
            const isActive = (selectedTag === tag) || (!selectedTag && tag === 'all');
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === 'all' ? '' : tag)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? '700' : '500',
                  backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-card)',
                  color: isActive ? 'var(--text-inverted)' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--text-main)' : 'var(--border-color)',
                  boxShadow: isActive ? 'var(--shadow-subtle)' : 'none',
                  textTransform: 'capitalize',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {tag === 'all' ? '✨ All Stories' : `#${tag}`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Blog Roll Grid Section */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--pastel-pink-text)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              {selectedTag ? `Stories tagged #${selectedTag}` : 'Recent Stories'}
            </h2>
          </div>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'} published
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-subtle)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '12px', animation: 'spin 2s infinite linear' }}>🌸</div>
            <p style={{ fontWeight: '500' }}>Loading stories fresh from the press...</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'var(--pastel-pink-soft)',
            border: '1px solid var(--pastel-pink)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <p style={{ color: 'var(--pastel-pink-text)', fontWeight: '600', marginBottom: '12px' }}>{error}</p>
            <button onClick={fetchPosts} className="btn-primary" style={{ fontSize: '0.85rem' }}>
              Try Again
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 24px',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '40px auto'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🌱</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>No stories found here yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {searchQuery ? `No matches for "${searchQuery}". Try a different keyword.` : 'Be the first to share an adorable story in this category!'}
            </p>
            <Link to="/admin" className="btn-primary" style={{ fontSize: '0.88rem' }}>
              <Sparkles size={15} />
              <span>Write a Story in Admin Studio</span>
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px'
          }}>
            {filteredPosts.map((post, postIndex) => (
              <article key={post.id} className="blog-card">
                {/* Cover Image */}
                {post.featured_image_url && (
                  <Link to={`/post/${post.slug}`} style={{ display: 'block', height: '210px', overflow: 'hidden', backgroundColor: 'var(--bg-subtle)' }}>
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  </Link>
                )}

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '14px' }}>
                  {/* Tags and Reading Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {post.tags && post.tags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className={`badge ${getTagBadgeClass(idx)}`}>
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
                      <Clock size={13} />
                      <span>{post.reading_time_minutes || 3} min read</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1.35', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                    <Link to={`/post/${post.slug}`} style={{ color: 'inherit' }}>
                      {post.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: '0.92rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {post.excerpt}
                  </p>

                  {/* Author & Footer */}
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--pastel-pink-soft)',
                        border: '1px solid var(--pastel-pink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--pastel-pink-text)'
                      }}>
                        {post.author_username ? post.author_username.charAt(0).toUpperCase() : '🌸'}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.1 }}>
                          {post.author_username || 'Staff Author'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/post/${post.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        color: 'var(--pastel-pink-text)'
                      }}
                    >
                      <span>Read</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
