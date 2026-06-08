const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'benteccserv',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'changeme',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('[DB] Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client', err);
});

/**
 * Initialize database schema
 */
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
          id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name            VARCHAR(255) NOT NULL,
          email           VARCHAR(255) NOT NULL,
          phone           VARCHAR(50),
          service         VARCHAR(100),
          message         TEXT NOT NULL,
          consent         BOOLEAN NOT NULL DEFAULT FALSE,
          source_ip       VARCHAR(45),
          user_agent      TEXT,
          created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('[DB] Schema initialized');
  } catch (err) {
    console.error('[DB] Schema init error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };