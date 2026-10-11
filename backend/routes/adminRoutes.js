const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAdmin } = require('../middleware/authMiddleware');

// Apply admin guard to all admin routes
router.use(requireAdmin);

// Utility to generate a slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Calculate estimated reading time
function estimateReadingTime(content = '') {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// GET /api/admin/posts - List all posts (drafts & published)
router.get('/posts', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.content,
        p.reading_time_minutes, 
        p.featured_image_url, 
        p.tags, 
        p.status, 
        p.created_at, 
        p.updated_at,
        u.username AS author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.updated_at DESC, p.created_at DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      posts: result.rows
    });
  } catch (err) {
    console.error('Admin fetch posts error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin posts.' });
  }
});

// GET /api/admin/posts/:id - Get specific post for editing
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*, u.username AS author_username 
       FROM posts p 
       LEFT JOIN users u ON p.author_id = u.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    return res.json({ success: true, post: result.rows[0] });
  } catch (err) {
    console.error('Admin get post error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve post details.' });
  }
});

// POST /api/admin/posts - Create new post
router.post('/posts', async (req, res) => {
  try {
    const { title, excerpt, content, featured_image_url, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    let baseSlug = slugify(title) || `story-${Date.now()}`;
    let finalSlug = baseSlug;
    
    // Check slug collision
    const existing = await query('SELECT id FROM posts WHERE slug = $1', [finalSlug]);
    if (existing.rows.length > 0) {
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const readingTime = estimateReadingTime(content);
    const postStatus = status === 'published' ? 'published' : 'draft';
    const tagArray = Array.isArray(tags) 
      ? tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
      : typeof tags === 'string' 
        ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
        : [];

    const computedExcerpt = excerpt && excerpt.trim() 
      ? excerpt.trim() 
      : content.replace(/[#*`>_\-\n]/g, ' ').substring(0, 160).trim() + '...';

    const insertSql = `
      INSERT INTO posts 
      (title, slug, excerpt, content, reading_time_minutes, featured_image_url, author_id, tags, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      title.trim(),
      finalSlug,
      computedExcerpt,
      content,
      readingTime,
      featured_image_url || null,
      req.user.id,
      tagArray,
      postStatus
    ];

    const result = await query(insertSql, values);

    return res.status(201).json({
      success: true,
      message: postStatus === 'published' ? 'Story published delightfully!' : 'Draft saved securely.',
      post: result.rows[0]
    });
  } catch (err) {
    console.error('Admin create post error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
});

// PUT /api/admin/posts/:id - Update existing post
router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, featured_image_url, tags, status } = req.body;

    const existingRes = await query('SELECT * FROM posts WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const existingPost = existingRes.rows[0];
    const newTitle = title !== undefined ? title.trim() : existingPost.title;
    const newContent = content !== undefined ? content : existingPost.content;
    const newStatus = status !== undefined ? (status === 'published' ? 'published' : 'draft') : existingPost.status;
    const newReadingTime = estimateReadingTime(newContent);
    
    let tagArray = existingPost.tags;
    if (tags !== undefined) {
      tagArray = Array.isArray(tags)
        ? tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
        : typeof tags === 'string'
          ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
          : [];
    }

    const newExcerpt = excerpt !== undefined && excerpt.trim()
      ? excerpt.trim()
      : newContent.replace(/[#*`>_\-\n]/g, ' ').substring(0, 160).trim() + '...';

    // Keep slug stable unless title changed dramatically
    let newSlug = existingPost.slug;
    if (title && title.trim() !== existingPost.title) {
      const generatedSlug = slugify(newTitle);
      const slugCheck = await query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [generatedSlug, id]);
      if (slugCheck.rows.length === 0) {
        newSlug = generatedSlug;
      }
    }

    const updateSql = `
      UPDATE posts
      SET title = $1, slug = $2, excerpt = $3, content = $4, reading_time_minutes = $5,
          featured_image_url = $6, tags = $7, status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      newTitle,
      newSlug,
      newExcerpt,
      newContent,
      newReadingTime,
      featured_image_url !== undefined ? featured_image_url : existingPost.featured_image_url,
      tagArray,
      newStatus,
      id
    ];

    const result = await query(updateSql, values);

    return res.json({
      success: true,
      message: 'Post updated successfully.',
      post: result.rows[0]
    });
  } catch (err) {
    console.error('Admin update post error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update post.' });
  }
});

// PATCH /api/admin/posts/:id/status - Toggle draft/published
router.patch('/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['draft', 'published'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'draft' or 'published'." });
    }

    const result = await query(
      'UPDATE posts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    return res.json({
      success: true,
      message: `Post status changed to ${status}.`,
      post: result.rows[0]
    });
  } catch (err) {
    console.error('Admin toggle status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

// DELETE /api/admin/posts/:id - Delete post
router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id, title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    return res.json({
      success: true,
      message: `Post "${result.rows[0].title}" removed successfully.`
    });
  } catch (err) {
    console.error('Admin delete post error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
});

module.exports = router;
