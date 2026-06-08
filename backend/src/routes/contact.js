const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * POST /api/contact
 * Submit a contact form inquiry
 * Body: { name, email, phone?, service?, message, consent }
 */
router.post('/', async (req, res) => {
  const { name, email, phone, service, message, consent } = req.body;

  // Server-side validation
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required (min 2 characters)');
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required');
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.push('Message is required (min 10 characters)');
  }
  if (consent !== true) {
    errors.push('You must consent to the privacy policy');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join('; ') });
  }

  // Sanitize inputs
  const sanitized = {
    name: name.trim().slice(0, 255),
    email: email.trim().toLowerCase().slice(0, 255),
    phone: phone ? phone.trim().slice(0, 50) : null,
    service: service && service !== '' ? service.trim().slice(0, 100) : null,
    message: message.trim().slice(0, 5000),
    consent: true,
    source_ip: req.ip || req.connection.remoteAddress,
    user_agent: req.headers['user-agent'] || null,
  };

  try {
    const result = await pool.query(
      `INSERT INTO contact_submissions (name, email, phone, service, message, consent, source_ip, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, created_at`,
      [sanitized.name, sanitized.email, sanitized.phone, sanitized.service,
       sanitized.message, sanitized.consent, sanitized.source_ip, sanitized.user_agent]
    );

    const submission = result.rows[0];

    console.log(`[Contact] New submission ${submission.id} from ${sanitized.email}`);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. We will get back to you within 24 hours.',
      id: submission.id,
      created_at: submission.created_at
    });
  } catch (err) {
    console.error('[Contact] Database error:', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error. Please try again later.' });
  }
});

/**
 * GET /api/contact/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'benteccserv-api', timestamp: new Date().toISOString() });
});

module.exports = router;