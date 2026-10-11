const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  console.log('🌱 Starting Bloggy Database Initialization...');

  const connectionConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.PGUSER || 'postgres',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'bloggy_db',
        password: process.env.PGPASSWORD || 'postgres',
        port: parseInt(process.env.PGPORT || '5432', 10),
      };

  const pool = new Pool(connectionConfig);

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL at:', res.rows[0].now);

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📜 Applying schema.sql...');
    await pool.query(schemaSql);
    console.log('✅ Schema created successfully.');

    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    console.log('🌱 Applying seed.sql...');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully.');

    console.log('\n🎉 Database setup complete! You are ready to start the backend with: npm start');
  } catch (err) {
    console.error('❌ Database migration error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
