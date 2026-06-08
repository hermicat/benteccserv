require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./db');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---- Security Middleware ----
app.use(helmet({
  contentSecurityPolicy: false, // CSP handled by frontend proxy
  crossOriginEmbedderPolicy: false,
}));

// ---- CORS ----
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost,http://localhost:80')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Relaxed for dev; tighten in production
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// ---- Body Parsing ----
app.use(express.json({ limit: '16kb' }));

// ---- Rate Limiting ----
const contactLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX || '20'),
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Routes ----
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'benteccserv-api',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/contact', contactLimiter, contactRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ---- Error Handler ----
app.use((err, req, res, next) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ---- Start ----
async function start() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Bentecc API running on port ${PORT} (${NODE_ENV})`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();