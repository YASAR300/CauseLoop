-- ============================================================
-- Migration: 003_indexes.sql
-- CauseLoop — Performance indexes on hot-path columns
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role        ON profiles(role);
CREATE INDEX idx_profiles_charity_id  ON profiles(charity_id);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Scores
CREATE INDEX idx_scores_user_id    ON scores(user_id);
CREATE INDEX idx_scores_score_date ON scores(score_date DESC);

-- Draws
CREATE INDEX idx_draws_status ON draws(status);
CREATE INDEX idx_draws_year_month ON draws(year DESC, month DESC);

-- Draw Entries
CREATE INDEX idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON draw_entries(user_id);

-- Winners
CREATE INDEX idx_winners_draw_id ON winners(draw_id);
CREATE INDEX idx_winners_user_id ON winners(user_id);
CREATE INDEX idx_winners_verification ON winners(verification_status);

-- Notifications Log
CREATE INDEX idx_notifications_user_id ON notifications_log(user_id);
CREATE INDEX idx_notifications_status  ON notifications_log(status);
CREATE INDEX idx_notifications_type    ON notifications_log(type);
