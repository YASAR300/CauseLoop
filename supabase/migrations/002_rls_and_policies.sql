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

DROP POLICY IF EXISTS "scores: own delete" ON scores;
CREATE POLICY "scores: own delete"
  ON scores FOR DELETE
  USING (user_id = auth.uid());

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
