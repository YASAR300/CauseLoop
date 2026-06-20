-- ============================================================
-- Migration: 002_stripe_events.sql
-- CauseLoop — Webhook Idempotency processed events
-- ============================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id          TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
