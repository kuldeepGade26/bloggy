const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/posts - Get all published posts
router.get('/', async (req, res) => {
  try {
    const { tag, search } = req.query;

    let sql = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.excerpt, 
        p.reading_time_minutes, 
        p.featured_image_url, 
        p.tags, 
        p.status, 
        p.created_at, 
        p.updated_at,
        u.username AS author_username
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = $1
    `;
    const params = ['published'];

    if (tag) {
      sql += ` AND $${params.length + 1} = ANY(p.tags)`;
      params.push(tag.toLowerCase());
    }

    if (search) {
      sql += ` AND (p.title ILIKE $${params.length + 1} OR p.excerpt ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);

    return res.json({
      success: true,
      count: result.rows.length,
      posts: result.rows
    });
  } catch (err) {
    console.error('Error fetching public posts:', err);
    return res.status(500).json({ success: false, message: 'Could not load posts.' });
  }
});

// GET /api/posts/:slug - Get single post by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const sql = `
      SELECT 
        p.id, 
        p.title, 
        p.slug, 
        p.content, 
        p.excerpt, 
        p.reading_time_minutes, 
        p.featured_image_url, 
        p.tags, 
        p.status, 
        p.created_at, 
        p.updated_at,
        u.username AS author_username,
        u.id AS author_id
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
      LIMIT 1
    `;

    const result = await query(sql, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const post = result.rows[0];

    // Only allow public access if published (or let client check)
    if (post.status !== 'published') {
      // In case admin is previewing draft via slug, they can pass token or view via admin route
      return res.status(404).json({ success: false, message: 'Post is currently in draft mode.' });
    }

    return res.json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Error fetching post by slug:', err);
    return res.status(500).json({ success: false, message: 'Could not load post details.' });
  }
});

module.exports = router;
