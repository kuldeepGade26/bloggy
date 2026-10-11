import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api';
import { 
  PenTool, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Upload, 
  Eye, 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  AlertCircle,
  Image as ImageIcon,
  Check,
  Send,
  Save,
  Lock,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, isAdmin, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'write'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Editor State
  const [editingPostId, setEditingPostId] = useState(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('cozy, minimalism');
  const [featuredImage, setFeaturedImage] = useState('');
  const [editorStatus, setEditorStatus] = useState('published'); // 'draft' or 'published'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      loadAdminPosts();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadAdminPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getAllPosts();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPostId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setTags('cozy, thoughts');
    setFeaturedImage('');
    setEditorStatus('published');
    setPreviewMode(false);
    setActiveTab('write');
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setExcerpt(post.excerpt || '');
    setContent(post.content);
    setTags(Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '');
    setFeaturedImage(post.featured_image_url || '');
    setEditorStatus(post.status);
    setPreviewMode(false);
    setActiveTab('write');
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      const res = await adminAPI.toggleStatus(post.id, newStatus);
      if (res.success) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p)));
        flashSuccess(`Story status changed to ${newStatus}.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDeletePost = async (id, postTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${postTitle}"?`)) return;
    try {
      const res = await adminAPI.deletePost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        flashSuccess(`"${postTitle}" was deleted.`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting story');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await adminAPI.uploadImage(file);
      if (res.success && res.url) {
        setFeaturedImage(res.url);
        flashSuccess('Cover image uploaded successfully to /uploads!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed. Max size is 5MB.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInsertMarkdownSnippet = (snippet) => {
    setContent((prev) => prev + '\n' + snippet + '\n');
  };

  const handleSavePost = async (targetStatus) => {
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and some story content.');
      return;
    }

    setIsSubmitting(true);
    const postPayload = {
      title,
      excerpt,
      content,
      tags,
      featured_image_url: featuredImage,
      status: targetStatus || editorStatus
    };

    try {
      if (editingPostId) {
        await adminAPI.updatePost(editingPostId, postPayload);
        flashSuccess('Story updated successfully!');
      } else {
        await adminAPI.createPost(postPayload);
        flashSuccess(targetStatus === 'published' ? 'Story published!' : 'Draft saved!');
      }
      await loadAdminPosts();
      setActiveTab('list');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save story.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Guard: If not Admin
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          backgroundColor: 'var(--pastel-pink-soft)',
          border: '1px solid var(--pastel-pink)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '20px'
        }}>
          🌸
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          Admin Studio Access Required
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.6', marginBottom: '28px' }}>
          The authoring studio and post management dashboard is protected for users with the <strong>admin</strong> role.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            onClick={() => openAuthModal('login')}
            className="btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <Lock size={16} />
            <span>Sign In as Admin</span>
          </button>
          <Link to="/" className="btn-secondary" style={{ padding: '12px 20px' }}>
            Back to Stories
          </Link>
        </div>

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-subtle)'
        }}>
          💡 <strong>Tip:</strong> Click "Sign In as Admin" and choose <em>"🌸 Admin (Editor)"</em> in the quick demo accounts for instant access.
        </div>
      </div>
    );
  }

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', paddingBottom: '80px' }}>
      {/* Admin Studio Top Bar */}
      <div style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)',
        padding: '20px 24px'
      }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                Author Studio
              </h1>
              <span className="badge badge-pink">Medium Mode</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Manage stories, publish drafts, and craft Medium-style essays.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab === 'write' ? (
              <>
                <button
                  onClick={() => setActiveTab('list')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <ArrowLeft size={15} />
                  <span>Exit Editor</span>
                </button>

                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Eye size={15} />
                  <span>{previewMode ? 'Edit Mode' : 'Preview'}</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleSavePost('draft')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', backgroundColor: 'var(--pastel-peach-soft)', borderColor: 'var(--pastel-peach)' }}
                >
                  <Save size={15} />
                  <span>Save Draft</span>
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={() => handleSavePost('published')}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <Send size={15} />
                  <span>{editingPostId ? 'Update Story' : 'Publish Story'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateNew}
                className="btn-primary"
                style={{ fontSize: '0.9rem' }}
              >
                <Plus size={16} />
                <span>Write a New Story</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div style={{
          maxWidth: '1120px',
          margin: '16px auto 0',
          padding: '0 24px',
        }}>
          <div style={{
            backgroundColor: '#E8F5E9',
            border: '1px solid #C8E6C9',
            color: '#2E7D32',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Studio Body */}
      <div style={{ maxWidth: '1120px', margin: '24px auto', padding: '0 24px' }}>
        {activeTab === 'list' ? (
          <div>
            {/* Metric Overview Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: '600' }}>TOTAL STORIES</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                  {posts.length}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--pastel-mint-text)', fontWeight: '600' }}>PUBLISHED (LIVE)</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--pastel-mint-text)', marginTop: '4px' }}>
                  {publishedCount}
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--pastel-peach-text)', fontWeight: '600' }}>SAVED DRAFTS</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--pastel-peach-text)', marginTop: '4px' }}>
                  {draftCount}
                </div>
              </div>
            </div>

            {/* Posts Table / List */}
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Your Manuscripts</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Click Edit or Toggle to change public visibility</span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-subtle)' }}>
                  Loading studio manuscripts...
                </div>
              ) : posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't written any manuscripts yet.</p>
                  <button onClick={handleCreateNew} className="btn-primary" style={{ fontSize: '0.86rem' }}>
                    <Plus size={15} />
                    <span>Create Your First Story</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span className={`badge ${post.status === 'published' ? 'badge-mint' : 'badge-peach'}`}>
                            {post.status === 'published' ? '● Published' : '○ Draft'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {post.reading_time_minutes || 3} min read
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                          {post.title}
                        </h3>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', gap: '12px' }}>
                          <span>Slug: /{post.slug}</span>
                          <span>•</span>
                          <span>Updated {new Date(post.updated_at || post.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {post.status === 'published' && (
                          <Link
                            to={`/post/${post.slug}`}
                            className="btn-secondary"
                            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                            title="View live post"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </Link>
                        )}

                        <button
                          onClick={() => handleToggleStatus(post)}
                          className="btn-secondary"
                          style={{
                            padding: '7px 12px',
                            fontSize: '0.8rem',
                            backgroundColor: post.status === 'published' ? 'var(--pastel-peach-soft)' : 'var(--pastel-mint-soft)',
                            borderColor: post.status === 'published' ? 'var(--pastel-peach)' : 'var(--pastel-mint)'
                          }}
                        >
                          <span>{post.status === 'published' ? 'Make Draft' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleEditPost(post)}
                          className="btn-secondary"
                          style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '0.8rem', color: '#D32F2F' }}
                          title="Delete post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Medium-Style Editor Tab */
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            padding: '40px 32px'
          }}>
            {previewMode ? (
              <div className="article-container" style={{ padding: '0 0 40px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span className={`badge ${editorStatus === 'published' ? 'badge-mint' : 'badge-peach'}`}>
                    Preview Mode ({editorStatus})
                  </span>
                </div>
                <h1 className="article-title">{title || 'Untitled Manuscript'}</h1>
                {excerpt && <p className="article-excerpt">{excerpt}</p>}
                {featuredImage && (
                  <img
                    src={featuredImage}
                    alt="Cover preview"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '16px', margin: '24px 0' }}
                  />
                )}
                <div className="article-body" style={{ marginTop: '24px' }}>
                  {content.split('\n').map((line, idx) => (
                    line.trim() ? <p key={idx}>{line}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Meta Inputs: Tags, Status, Cover */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  marginBottom: '28px',
                  padding: '20px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  {/* Status Toggle */}
                  <div>
                    <label className="input-label">Story Status</label>
                    <select
                      value={editorStatus}
                      onChange={(e) => setEditorStatus(e.target.value)}
                      className="form-input"
                    >
                      <option value="published">🌸 Published (Visible to Readers)</option>
                      <option value="draft">☕ Draft (Private / Admin Only)</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="input-label">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="cozy, design, engineering"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* Cover Image Uploader */}
                  <div>
                    <label className="input-label">Featured Cover Image</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Image URL or upload below..."
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        className="form-input"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="btn-secondary"
                        style={{ padding: '0 14px', whiteSpace: 'nowrap' }}
                        title="Upload local image via Multer endpoint"
                      >
                        <Upload size={14} />
                        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Excerpt */}
                <div style={{ marginBottom: '24px' }}>
                  <input
                    type="text"
                    placeholder="Write a sweet subtitle or short summary..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '1.2rem',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '12px'
                    }}
                  />
                </div>

                {/* Featured image thumbnail if present */}
                {featuredImage && (
                  <div style={{ position: 'relative', marginBottom: '24px', display: 'inline-block' }}>
                    <img
                      src={featuredImage}
                      alt="Cover Preview"
                      style={{ maxHeight: '180px', borderRadius: '12px', border: '1px solid var(--border-color)', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Medium-like Title */}
                <input
                  type="text"
                  placeholder="Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="medium-editor-title"
                />

                {/* Markdown Quick Toolbar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontWeight: '600', marginRight: '6px' }}>FORMAT:</span>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('## Heading 2')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>H2</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('### Heading 3')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>H3</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('> A beautiful quote inspires here.')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>Quote</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('```javascript\nconsole.log("hello cozy code");\n```')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>Code</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('- List item')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>Bullet</button>
                  <button type="button" onClick={() => handleInsertMarkdownSnippet('![Delightful caption](https://images.unsplash.com/photo-1517842645767-c639042777db?w=1000)')} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>Image</button>
                </div>

                {/* Medium-like Distraction-Free Story Textarea */}
                <textarea
                  placeholder="Tell your story... (Supports markdown, quotes, code blocks)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="medium-editor-textarea"
                />

                {/* Footer Word Count & Stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  marginTop: '16px',
                  fontSize: '0.82rem',
                  color: 'var(--text-subtle)'
                }}>
                  <div>
                    {content.trim() ? content.trim().split(/\s+/).length : 0} words • ~
                    {Math.max(1, Math.ceil((content.trim().split(/\s+/).length || 1) / 200))} min reading time
                  </div>
                  <div>
                    Automatic draft backup active in memory
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
