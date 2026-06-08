-- ========================================
-- Bentecc Engineering Services
-- PostgreSQL Schema for Contact Submissions
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contact submissions table
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

-- Index for sorting by date
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
    ON contact_submissions (created_at DESC);

-- Index for searching by email
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email
    ON contact_submissions (email);

-- Row-level security comment
COMMENT ON TABLE contact_submissions IS 'Visitor contact form submissions from benteccserv.com';
COMMENT ON COLUMN contact_submissions.id IS 'Unique submission identifier';
COMMENT ON COLUMN contact_submissions.source_ip IS 'IPv4 or IPv6 address of submitter';
COMMENT ON COLUMN contact_submissions.created_at IS 'UTC timestamp of submission';