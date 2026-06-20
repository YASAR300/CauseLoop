-- ============================================================
-- FROM FILE: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- Migration: 001_initial_schema.sql
-- CauseLoop — Full relational schema, enums, constraints
-- ============================================================

-- --------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('visitor', 'subscriber', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
        CREATE TYPE plan_type AS ENUM ('monthly', 'yearly');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sub_status') THEN
        CREATE TYPE sub_status AS ENUM ('active', 'inactive', 'cancelled', 'lapsed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draw_type') THEN
        CREATE TYPE draw_type AS ENUM ('three_match', 'four_match', 'five_match');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'logic_type') THEN
        CREATE TYPE logic_type AS ENUM ('random', 'algorithmic');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draw_status') THEN
        CREATE TYPE draw_status AS ENUM ('draft', 'simulated', 'published');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verify_status') THEN
        CREATE TYPE verify_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notif_status') THEN
        CREATE TYPE notif_status AS ENUM ('sent', 'failed', 'pending');
    END IF;
END$$;

-- --------------------------------------------------------
-- CHARITIES
-- Must be created before profiles (FK dependency)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS charities (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT        NOT NULL,
  description       TEXT,
  image_urls        TEXT[]      NOT NULL DEFAULT '{}',
  upcoming_events   JSONB       NOT NULL DEFAULT '[]',
  is_featured       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- PROFILES (1-to-1 with auth.users)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id                            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                          user_role   NOT NULL DEFAULT 'visitor',
  full_name                     TEXT,
  charity_id                    UUID        REFERENCES charities(id) ON DELETE SET NULL,
  charity_contribution_percentage NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT charity_contribution_min CHECK (charity_contribution_percentage >= 10)
);

-- --------------------------------------------------------
-- SUBSCRIPTIONS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type              plan_type   NOT NULL,
  status                 sub_status  NOT NULL DEFAULT 'inactive',
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT        UNIQUE,
  current_period_end     TIMESTAMPTZ,
  renewal_date           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- SCORES
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS scores (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score_value INTEGER     NOT NULL,
  score_date  DATE        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT score_value_range CHECK (score_value BETWEEN 1 AND 45),
  CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- --------------------------------------------------------
-- DRAWS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS draws (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  month                 SMALLINT     NOT NULL CHECK (month BETWEEN 1 AND 12),
  year                  SMALLINT     NOT NULL,
  draw_type             draw_type    NOT NULL,
  logic_type            logic_type   NOT NULL DEFAULT 'random',
  status                draw_status  NOT NULL DEFAULT 'draft',
  winning_numbers       INTEGER[]    NOT NULL DEFAULT '{}',
  prize_pool_amount     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  jackpot_rollover_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_draw_month_year_type UNIQUE (month, year, draw_type)
);

-- --------------------------------------------------------
-- DRAW ENTRIES
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS draw_entries (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id         UUID         NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id         UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  numbers_played  INTEGER[]    NOT NULL,
  match_count     SMALLINT     NOT NULL DEFAULT 0,
  prize_amount    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_draw_entry UNIQUE (draw_id, user_id)
);

-- --------------------------------------------------------
-- WINNERS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS winners (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id             UUID           NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id             UUID           NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proof_image_url     TEXT,
  verification_status verify_status  NOT NULL DEFAULT 'pending',
  payment_status      payment_status NOT NULL DEFAULT 'pending',
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- NOTIFICATIONS LOG
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS notifications_log (
  id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type      TEXT         NOT NULL,
  sent_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  status    notif_status NOT NULL DEFAULT 'pending',
  metadata  JSONB        NOT NULL DEFAULT '{}'
);

-- --------------------------------------------------------
-- AUTO-UPDATE updated_at FUNCTION + TRIGGERS
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_charities_updated_at ON charities;
CREATE TRIGGER trg_charities_updated_at
  BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_draws_updated_at ON draws;
CREATE TRIGGER trg_draws_updated_at
  BEFORE UPDATE ON draws
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_winners_updated_at ON winners;
CREATE TRIGGER trg_winners_updated_at
  BEFORE UPDATE ON winners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- AUTO-CREATE PROFILE ON AUTH USER SIGN-UP
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, charity_contribution_percentage)
  VALUES (
    NEW.id,
    'subscriber'::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    10.00
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- FROM FILE: 002_rls_and_policies.sql
-- ============================================================

-- ============================================================
-- Migration: 002_rls_and_policies.sql
-- CauseLoop — Row Level Security + Reusable Admin Helper
-- ============================================================

-- --------------------------------------------------------
-- REUSABLE ADMIN CHECK FUNCTION
-- Called by every admin policy — defined once, used everywhere.
-- SECURITY DEFINER so it runs with superuser privileges to
-- read profiles.role without hitting its own RLS.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id   = auth.uid()
      AND role = 'admin'::public.user_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-- --------------------------------------------------------

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws             ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------

-- Users can read their own profile
DROP POLICY IF EXISTS "profiles: own select" ON profiles;
CREATE POLICY "profiles: own select"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Users can insert their own profile (triggered by handle_new_user,
-- but also allows manual calls)
DROP POLICY IF EXISTS "profiles: own insert" ON profiles;
CREATE POLICY "profiles: own insert"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "profiles: own update" ON profiles;
CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only admins can delete profiles
DROP POLICY IF EXISTS "profiles: admin delete" ON profiles;
CREATE POLICY "profiles: admin delete"
  ON profiles FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- CHARITIES POLICIES
-- --------------------------------------------------------

-- Anyone authenticated can read charities
DROP POLICY IF EXISTS "charities: authenticated select" ON charities;
CREATE POLICY "charities: authenticated select"
  ON charities FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete charities
DROP POLICY IF EXISTS "charities: admin insert" ON charities;
CREATE POLICY "charities: admin insert"
  ON charities FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "charities: admin update" ON charities;
CREATE POLICY "charities: admin update"
  ON charities FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "charities: admin delete" ON charities;
CREATE POLICY "charities: admin delete"
  ON charities FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- SUBSCRIPTIONS POLICIES
-- --------------------------------------------------------

DROP POLICY IF EXISTS "subscriptions: own select" ON subscriptions;
CREATE POLICY "subscriptions: own select"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "subscriptions: own insert" ON subscriptions;
CREATE POLICY "subscriptions: own insert"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions: own update" ON subscriptions;
CREATE POLICY "subscriptions: own update"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "subscriptions: admin delete" ON subscriptions;
CREATE POLICY "subscriptions: admin delete"
  ON subscriptions FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- SCORES POLICIES
-- --------------------------------------------------------

DROP POLICY IF EXISTS "scores: own select" ON scores;
CREATE POLICY "scores: own select"
  ON scores FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "scores: own insert" ON scores;
CREATE POLICY "scores: own insert"
  ON scores FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "scores: own update" ON scores;
CREATE POLICY "scores: own update"
  ON scores FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "scores: admin delete" ON scores;
CREATE POLICY "scores: admin delete"
  ON scores FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- DRAWS POLICIES
-- --------------------------------------------------------

-- All authenticated users can read published draws
DROP POLICY IF EXISTS "draws: authenticated select" ON draws;
CREATE POLICY "draws: authenticated select"
  ON draws FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (status = 'published' OR is_admin())
  );

DROP POLICY IF EXISTS "draws: admin insert" ON draws;
CREATE POLICY "draws: admin insert"
  ON draws FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "draws: admin update" ON draws;
CREATE POLICY "draws: admin update"
  ON draws FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "draws: admin delete" ON draws;
CREATE POLICY "draws: admin delete"
  ON draws FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- DRAW_ENTRIES POLICIES
-- --------------------------------------------------------

DROP POLICY IF EXISTS "draw_entries: own select" ON draw_entries;
CREATE POLICY "draw_entries: own select"
  ON draw_entries FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "draw_entries: own insert" ON draw_entries;
CREATE POLICY "draw_entries: own insert"
  ON draw_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "draw_entries: own update" ON draw_entries;
CREATE POLICY "draw_entries: own update"
  ON draw_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "draw_entries: admin delete" ON draw_entries;
CREATE POLICY "draw_entries: admin delete"
  ON draw_entries FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- WINNERS POLICIES
-- --------------------------------------------------------

-- Winners can see their own win; admins see all
DROP POLICY IF EXISTS "winners: own select" ON winners;
CREATE POLICY "winners: own select"
  ON winners FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Only admins manage winner records
DROP POLICY IF EXISTS "winners: admin insert" ON winners;
CREATE POLICY "winners: admin insert"
  ON winners FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "winners: admin update" ON winners;
CREATE POLICY "winners: admin update"
  ON winners FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "winners: admin delete" ON winners;
CREATE POLICY "winners: admin delete"
  ON winners FOR DELETE
  USING (is_admin());

-- --------------------------------------------------------
-- NOTIFICATIONS_LOG POLICIES
-- --------------------------------------------------------

-- Users can see their own notification history
DROP POLICY IF EXISTS "notifications_log: own select" ON notifications_log;
CREATE POLICY "notifications_log: own select"
  ON notifications_log FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- Only server-side (service role) or admin may insert
DROP POLICY IF EXISTS "notifications_log: admin insert" ON notifications_log;
CREATE POLICY "notifications_log: admin insert"
  ON notifications_log FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "notifications_log: admin update" ON notifications_log;
CREATE POLICY "notifications_log: admin update"
  ON notifications_log FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "notifications_log: admin delete" ON notifications_log;
CREATE POLICY "notifications_log: admin delete"
  ON notifications_log FOR DELETE
  USING (is_admin());


-- ============================================================
-- FROM FILE: 002_stripe_events.sql
-- ============================================================

-- ============================================================
-- Migration: 002_stripe_events.sql
-- CauseLoop — Webhook Idempotency processed events
-- ============================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  id          TEXT        PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- FROM FILE: 003_indexes.sql
-- ============================================================

-- ============================================================
-- Migration: 003_indexes.sql
-- CauseLoop — Performance indexes on hot-path columns
-- ============================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_charity_id  ON profiles(charity_id);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Scores
CREATE INDEX IF NOT EXISTS idx_scores_user_id    ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_score_date ON scores(score_date DESC);

-- Draws
CREATE INDEX IF NOT EXISTS idx_draws_status ON draws(status);
CREATE INDEX IF NOT EXISTS idx_draws_year_month ON draws(year DESC, month DESC);

-- Draw Entries
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);

-- Winners
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_verification ON winners(verification_status);

-- Notifications Log
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status  ON notifications_log(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type    ON notifications_log(type);


