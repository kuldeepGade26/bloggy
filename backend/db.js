const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// PostgreSQL Configuration
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.includes('localhost') 
        ? { rejectUnauthorized: false } 
        : false,
    }
  : {
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'bloggy_db',
      password: process.env.PGPASSWORD || 'postgres',
      port: parseInt(process.env.PGPORT || '5432', 10),
      connectionTimeoutMillis: 1500,
    };

const pool = new Pool(connectionConfig);

let usePostgres = true;
let inMemoryDb = null;

// File-backed mock store path for graceful offline local fallback
const fallbackDataDir = path.join(__dirname, 'data');
const fallbackDataFile = path.join(fallbackDataDir, 'dev_store.json');

// Initialize Mock Store if Postgres is unreachable
async function initFallbackStore() {
  if (!fs.existsSync(fallbackDataDir)) {
    fs.mkdirSync(fallbackDataDir, { recursive: true });
  }

  if (fs.existsSync(fallbackDataFile)) {
    try {
      inMemoryDb = JSON.parse(fs.readFileSync(fallbackDataFile, 'utf8'));
      return;
    } catch (e) {
      console.error('[DB Fallback] Error reading dev_store.json, creating new store:', e.message);
    }
  }

  const defaultPasswordHash = await bcrypt.hash('adminpassword123', 10);
  inMemoryDb = {
    users: [
      {
        id: 1,
        username: 'cherryblossom',
        email: 'admin@bloggy.local',
        password_hash: defaultPasswordHash,
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'mochi_reader',
        email: 'reader@bloggy.local',
        password_hash: defaultPasswordHash,
        role: 'reader',
        created_at: new Date().toISOString()
      }
    ],
    posts: [
      {
        id: 1,
        title: 'The Gentle Art of Cozy Coding',
        slug: 'the-gentle-art-of-cozy-coding',
        excerpt: 'How warm cups of matcha, soft lo-fi beats, and intentional pauses create software with heart and soul.',
        content: `### Finding Joy in the Little Details\n\nThere is a special quiet in the early morning before the world wakes up. When the kettle hums, and the aroma of freshly whisked matcha fills the room, opening a code editor feels less like work and more like crafting a cozy sanctuary.\n\n### Creating Your Comfort Zone\nIn modern software engineering, we often obsess over velocity, output metrics, and aggressive deadlines. But what if craftsmanship requires calm?\n\n1. **Warm Lighting**: Swap glaring overhead lights for soft 2700K ambient desk lamps.\n2. **Curated Sounds**: A gentle playlist of raindrops and acoustic guitar.\n3. **Mindful Commits**: Write commit messages that tell a story of gratitude and care.\n\n> "Simplicity is not about having less. It is about making room for what matters."\n\nWhen we treat our tools with tenderness, our software becomes simpler, more robust, and infinitely more delightful to use.`,
        reading_time_minutes: 4,
        featured_image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
        author_id: 1,
        author_username: 'cherryblossom',
        tags: ['cozy', 'lifestyle', 'productivity', 'mindfulness'],
        status: 'published',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 2,
        title: 'Pastel Aesthetics in Modern Minimalist Design',
        slug: 'pastel-aesthetics-in-modern-minimalist-design',
        excerpt: 'Why soft creams, blush tones, and sage greens evoke psychological warmth and digital tranquility.',
        content: `### The Psychology of Soft Tones\n\nFor years, digital interfaces swung between sterile clinical white and stark obsidian dark mode. Today, a softer movement is flourishing: humanized interfaces wrapped in soothing pastel shades.\n\n- **Cream (#FAF7F2)** provides an organic canvas, reminiscent of handmade parchment.\n- **Blush Rose (#FAD2E1)** introduces warmth and empathy without the urgency of crimson.\n- **Soft Sage (#D8E2DC)** grounds the reader in natural harmony.\n\n### Rounded Radii & Micro-Elevations\nPairing subtle tones with 20px card radiuses and diffused shadows transforms rigid digital boxes into tactile, comforting cards.`,
        reading_time_minutes: 3,
        featured_image_url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
        author_id: 1,
        author_username: 'cherryblossom',
        tags: ['design', 'ux', 'minimalism'],
        status: 'published',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        title: 'Building Calm Web Architectures with Node and PostgreSQL',
        slug: 'building-calm-web-architectures',
        excerpt: 'Architectural reflections on keep-it-simple engineering: lightweight REST endpoints, index hygiene, and resilient proxies.',
        content: `### Serenity in System Design\n\nHigh-performing systems do not need to be intimidating monstrosities. By adhering to clean, foundational principles—like Express routers, parameterized PostgreSQL queries, and an Apache2 reverse proxy—we achieve enterprise-grade resilience with pure serenity.\n\n### The Recipe for Digital Peace of Mind\n\n- Parameterized SQL prevents injection effortlessly.\n- PM2 supervises processes quietly in the background.\n- Apache2 SSL termination handles TLS handshakes cleanly.`,
        reading_time_minutes: 5,
        featured_image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        author_id: 1,
        author_username: 'cherryblossom',
        tags: ['engineering', 'postgresql', 'nodejs'],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 4,
        title: 'Draft Thoughts on Micro-Journaling',
        slug: 'draft-thoughts-on-micro-journaling',
        excerpt: 'A quick unpublished reflection on capturing two sentences a day.',
        content: `This is a draft post to demonstrate the admin dashboard draft vs published toggles. Readers cannot see this until it is published!`,
        reading_time_minutes: 2,
        featured_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        author_id: 1,
        author_username: 'cherryblossom',
        tags: ['personal', 'draft'],
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    nextUserId: 3,
    nextPostId: 5
  };
  saveFallbackStore();
}

function saveFallbackStore() {
  if (inMemoryDb) {
    fs.writeFileSync(fallbackDataFile, JSON.stringify(inMemoryDb, null, 2), 'utf8');
  }
}

// Auto Initialize tables if PostgreSQL is active
async function initDatabase() {
  try {
    const testRes = await pool.query('SELECT NOW()');
    console.log('[DB] Connected to PostgreSQL successfully at', testRes.rows[0].now);
    usePostgres = true;

    // Run schema
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('[DB] PostgreSQL schema checked/created successfully.');

    // Check if users table is empty, if so, seed
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count, 10) === 0) {
      console.log('[DB] Users table empty, executing seed.sql...');
      const seedSql = fs.readFileSync(path.join(__dirname, 'database', 'seed.sql'), 'utf8');
      await pool.query(seedSql);
      console.log('[DB] PostgreSQL seed data inserted.');
    }
  } catch (err) {
    console.warn('[DB] PostgreSQL connection notice:', err.message);
    console.warn('[DB] Switching to built-in development datastore (persisted to backend/data/dev_store.json).');
    console.warn('[DB] Set valid PostgreSQL credentials in .env to switch to PostgreSQL.');
    usePostgres = false;
    await initFallbackStore();
  }
}

// Universal query runner
const query = async (text, params = []) => {
  if (usePostgres) {
    return pool.query(text, params);
  }

  // Graceful Mock Implementation for zero-setup local dev/testing
  if (!inMemoryDb) {
    await initFallbackStore();
  }

  const normalized = text.trim();

  // 1. SELECT * FROM users WHERE email = $1 / username = $1
  if (/FROM users WHERE email = \$1/i.test(normalized)) {
    const user = inMemoryDb.users.find(u => u.email.toLowerCase() === params[0].toLowerCase());
    return { rows: user ? [{ ...user }] : [] };
  }
  if (/FROM users WHERE username = \$1/i.test(normalized)) {
    const user = inMemoryDb.users.find(u => u.username.toLowerCase() === params[0].toLowerCase());
    return { rows: user ? [{ ...user }] : [] };
  }
  if (/FROM users WHERE id = \$1/i.test(normalized)) {
    const user = inMemoryDb.users.find(u => u.id === parseInt(params[0], 10));
    return { rows: user ? [{ ...user }] : [] };
  }

  // 2. INSERT INTO users
  if (/INSERT INTO users/i.test(normalized)) {
    const newUser = {
      id: inMemoryDb.nextUserId++,
      username: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'reader',
      created_at: new Date().toISOString()
    };
    inMemoryDb.users.push(newUser);
    saveFallbackStore();
    return { rows: [newUser] };
  }

  // 3. SELECT published posts with author join
  if (/FROM posts[\s\S]*status = \$1/i.test(normalized) && params[0] === 'published') {
    let posts = inMemoryDb.posts
      .filter(p => p.status === 'published')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Optional tag filtering
    if (params.length > 1 && params[1]) {
      posts = posts.filter(p => p.tags && p.tags.includes(params[1]));
    }

    const rows = posts.map(p => {
      const author = inMemoryDb.users.find(u => u.id === p.author_id) || {};
      return { ...p, author_username: author.username || 'Staff Author' };
    });
    return { rows };
  }

  // 4. SELECT single post by slug
  if (/FROM posts[\s\S]*slug = \$1/i.test(normalized)) {
    const post = inMemoryDb.posts.find(p => p.slug === params[0]);
    if (!post) return { rows: [] };
    const author = inMemoryDb.users.find(u => u.id === post.author_id) || {};
    return { rows: [{ ...post, author_username: author.username || 'Staff Author' }] };
  }

  // 5. SELECT single post by id
  if (/FROM posts[\s\S]*id = \$1/i.test(normalized)) {
    const post = inMemoryDb.posts.find(p => p.id === parseInt(params[0], 10));
    if (!post) return { rows: [] };
    const author = inMemoryDb.users.find(u => u.id === post.author_id) || {};
    return { rows: [{ ...post, author_username: author.username || 'Staff Author' }] };
  }

  // 6. SELECT all posts (admin view)
  if (/FROM posts/i.test(normalized) && !/WHERE/i.test(normalized)) {
    const posts = inMemoryDb.posts
      .slice()
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const rows = posts.map(p => {
      const author = inMemoryDb.users.find(u => u.id === p.author_id) || {};
      return { ...p, author_username: author.username || 'Staff Author' };
    });
    return { rows };
  }

  // 7. INSERT INTO posts
  if (/INSERT INTO posts/i.test(normalized)) {
    const newPost = {
      id: inMemoryDb.nextPostId++,
      title: params[0],
      slug: params[1],
      excerpt: params[2],
      content: params[3],
      reading_time_minutes: params[4] || 3,
      featured_image_url: params[5],
      author_id: parseInt(params[6], 10),
      tags: Array.isArray(params[7]) ? params[7] : [],
      status: params[8] || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryDb.posts.push(newPost);
    saveFallbackStore();
    return { rows: [newPost] };
  }

  // 8. UPDATE posts
  if (/UPDATE posts/i.test(normalized)) {
    // If it's a status toggle update
    if (/status = \$1/i.test(normalized) && /WHERE id = \$2/i.test(normalized)) {
      const post = inMemoryDb.posts.find(p => p.id === parseInt(params[1], 10));
      if (post) {
        post.status = params[0];
        post.updated_at = new Date().toISOString();
        saveFallbackStore();
        return { rows: [post] };
      }
    } else {
      // Full post update
      const id = parseInt(params[params.length - 1], 10);
      const post = inMemoryDb.posts.find(p => p.id === id);
      if (post) {
        post.title = params[0];
        post.slug = params[1];
        post.excerpt = params[2];
        post.content = params[3];
        post.reading_time_minutes = params[4];
        post.featured_image_url = params[5];
        post.tags = Array.isArray(params[6]) ? params[6] : [];
        post.status = params[7];
        post.updated_at = new Date().toISOString();
        saveFallbackStore();
        return { rows: [post] };
      }
    }
    return { rows: [] };
  }

  // 9. DELETE FROM posts WHERE id = $1
  if (/DELETE FROM posts/i.test(normalized)) {
    const id = parseInt(params[0], 10);
    const index = inMemoryDb.posts.findIndex(p => p.id === id);
    if (index !== -1) {
      const removed = inMemoryDb.posts.splice(index, 1);
      saveFallbackStore();
      return { rows: removed };
    }
    return { rows: [] };
  }

  return { rows: [] };
};

module.exports = {
  pool,
  query,
  initDatabase,
  isPostgres: () => usePostgres,
};
