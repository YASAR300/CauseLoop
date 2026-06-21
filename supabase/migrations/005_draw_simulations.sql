-- ============================================================
-- Migration: 005_draw_simulations.sql
-- CauseLoop — Separate table for draw simulation runs
-- ============================================================

CREATE TABLE IF NOT EXISTS draw_simulations (
  id                    UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id               UUID           NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  winning_numbers       INTEGER[]      NOT NULL,
  prize_pool_amount     NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  jackpot_rollover_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  projected_winners     JSONB          NOT NULL DEFAULT '[]', -- JSON array of { userId, full_name, email, match_count, prize_amount }
  simulated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by draw_id
CREATE INDEX IF NOT EXISTS idx_draw_simulations_draw_id ON draw_simulations(draw_id);

-- Enable RLS
ALTER TABLE draw_simulations ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read simulations (since admins are authenticated)
-- Using is_admin() helper to restrict to admin roles only
DROP POLICY IF EXISTS "draw_simulations: admin select" ON draw_simulations;
CREATE POLICY "draw_simulations: admin select"
  ON draw_simulations FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "draw_simulations: admin insert" ON draw_simulations;
CREATE POLICY "draw_simulations: admin insert"
  ON draw_simulations FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "draw_simulations: admin delete" ON draw_simulations;
CREATE POLICY "draw_simulations: admin delete"
  ON draw_simulations FOR DELETE
  USING (is_admin());
