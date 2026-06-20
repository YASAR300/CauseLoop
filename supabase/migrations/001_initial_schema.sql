-- ============================================================
-- Migration: 001_initial_schema.sql
-- CauseLoop — Full relational schema, enums, constraints
-- ============================================================

-- --------------------------------------------------------
-- ENUMS
-- --------------------------------------------------------

CREATE TYPE user_role       AS ENUM ('visitor', 'subscriber', 'admin');
CREATE TYPE plan_type       AS ENUM ('monthly', 'yearly');
CREATE TYPE sub_status      AS ENUM ('active', 'inactive', 'cancelled', 'lapsed');
CREATE TYPE draw_type       AS ENUM ('three_match', 'four_match', 'five_match');
CREATE TYPE logic_type      AS ENUM ('random', 'algorithmic');
CREATE TYPE draw_status     AS ENUM ('draft', 'simulated', 'published');
CREATE TYPE verify_status   AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status  AS ENUM ('pending', 'paid');
CREATE TYPE notif_status    AS ENUM ('sent', 'failed', 'pending');

-- --------------------------------------------------------
-- CHARITIES
-- Must be created before profiles (FK dependency)
-- --------------------------------------------------------

CREATE TABLE charities (
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

CREATE TABLE profiles (
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

CREATE TABLE subscriptions (
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

CREATE TABLE scores (
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

CREATE TABLE draws (
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

CREATE TABLE draw_entries (
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

CREATE TABLE winners (
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

CREATE TABLE notifications_log (
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

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_charities_updated_at
  BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_draws_updated_at
  BEFORE UPDATE ON draws
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_winners_updated_at
  BEFORE UPDATE ON winners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- AUTO-CREATE PROFILE ON AUTH USER SIGN-UP
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
