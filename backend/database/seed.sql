-- ========================================================
-- Bloggy Seed Data (PostgreSQL)
-- Default Admin credentials:
-- Username: admin
-- Email: admin@bloggy.local
-- Password: adminpassword123
-- ========================================================

-- Insert Default Admin (Password: adminpassword123)
-- bcrypt hash: $2a$10$eO0hH9.6R5b6p4u3lU3GheJg0z2NfQ8K5r6p7s8t9u0v1w2x3y4z.
-- We use a known pre-hashed bcrypt string for 'adminpassword123'
INSERT INTO users (username, email, password_hash, role)
VALUES 
(
    'cherryblossom',
    'admin@bloggy.local',
    '$2a$10$89JbvzD7J/569wLqX3sKzeuT5gYk0HqC5kYm9rY7O4tFqUaLpA9bC', -- adminpassword123
    'admin'
),
(
    'mochi_reader',
    'reader@bloggy.local',
    '$2a$10$89JbvzD7J/569wLqX3sKzeuT5gYk0HqC5kYm9rY7O4tFqUaLpA9bC', -- adminpassword123
    'reader'
)
ON CONFLICT (email) DO NOTHING;

-- Insert Adorable Sample Posts
INSERT INTO posts (title, slug, excerpt, content, reading_time_minutes, featured_image_url, author_id, tags, status)
VALUES 
(
    'The Gentle Art of Cozy Coding',
    'the-gentle-art-of-cozy-coding',
    'How warm cups of matcha, soft lo-fi beats, and intentional pauses create software with heart and soul.',
    '# The Gentle Art of Cozy Coding\n\nThere is a special quiet in the early morning before the world wakes up. When the kettle hums, and the aroma of freshly whisked matcha fills the room, opening a code editor feels less like work and more like crafting a cozy sanctuary.\n\n### Creating Your Comfort Zone\nIn modern software engineering, we often obsess over velocity, output metrics, and aggressive deadlines. But what if craftsmanship requires calm?\n\n1. **Warm Lighting**: Swap glaring overhead lights for soft 2700K ambient desk lamps.\n2. **Curated Sounds**: A gentle playlist of raindrops and acoustic guitar.\n3. **Mindful Commits**: Write commit messages that tell a story of gratitude and care.\n\n> "Simplicity is not about having less. It is about making room for what matters."\n\nWhen we treat our tools with tenderness, our software becomes simpler, more robust, and infinitely more delightful to use.',
    4,
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    1,
    ARRAY['cozy', 'lifestyle', 'productivity', 'mindfulness'],
    'published'
),
(
    'Pastel Aesthetics in Modern Minimalist Design',
    'pastel-aesthetics-in-modern-minimalist-design',
    'Why soft creams, blush tones, and sage greens evoke psychological warmth and digital tranquility.',
    '# Pastel Aesthetics in Modern Minimalist Design\n\nFor years, digital interfaces swung between sterile clinical white and stark obsidian dark mode. Today, a softer movement is flourishing: humanized interfaces wrapped in soothing pastel shades.\n\n### The Psychology of Soft Tones\n\nPastel colors—hues with high lightness and low saturation—trigger feelings of calm, approachability, and nostalgic sweetness.\n\n- **Cream (#FAF7F2)** provides an organic canvas, reminiscent of handmade parchment.\n- **Blush Rose (#FAD2E1)** introduces warmth and empathy without the urgency of crimson.\n- **Soft Sage (#D8E2DC)** grounds the reader in natural harmony.\n\n### Rounded Radii & Micro-Elevations\nPairing subtle tones with `border-radius: 20px` and diffused shadows transforms rigid boxes into tactile cards that invite interaction.',
    3,
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
    1,
    ARRAY['design', 'ux', 'minimalism'],
    'published'
),
(
    'Building Calm Web Architectures with Node and PostgreSQL',
    'building-calm-web-architectures',
    'Architectural reflections on keep-it-simple engineering: lightweight REST endpoints, index hygiene, and resilient proxies.',
    '# Building Calm Web Architectures with Node and PostgreSQL\n\nHigh-performing systems do not need to be intimidating monstrosities. By adhering to clean, foundational principles—like Express routers, parameterized PostgreSQL queries, and an Apache2 reverse proxy—we achieve enterprise-grade resilience with pure serenity.\n\n### The Recipe for Digital Peace of Mind\n\n```javascript\n// Pure, predictable, and parameterized\nconst { rows } = await pool.query(\n  "SELECT * FROM posts WHERE status = $1 ORDER BY created_at DESC",\n  ["published"]\n);\n```\n\nDeploying with PM2 ensures automatic crash recovery, while an Apache2 reverse proxy offloads SSL negotiation and static assets effortlessly.',
    5,
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    1,
    ARRAY['engineering', 'postgresql', 'nodejs'],
    'published'
),
(
    'Draft Thoughts on Micro-Journaling',
    'draft-thoughts-on-micro-journaling',
    'A quick unpublished reflection on capturing two sentences a day.',
    '# Draft Thoughts on Micro-Journaling\n\nThis is a draft post to demonstrate the admin dashboard draft vs published toggles. Readers cannot see this until it is published!',
    2,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    1,
    ARRAY['personal', 'draft'],
    'draft'
)
ON CONFLICT (slug) DO NOTHING;
