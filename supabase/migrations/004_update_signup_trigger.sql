-- ============================================================
-- Migration: 004_update_signup_trigger.sql
-- CauseLoop — Update handle_new_user trigger to extract charity
-- metadata on sign up.
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_charity_id uuid;
  meta_percent numeric;
BEGIN
  -- Extract charity_id if valid UUID
  BEGIN
    meta_charity_id := (NEW.raw_user_meta_data->>'charity_id')::uuid;
  EXCEPTION WHEN OTHERS THEN
    meta_charity_id := NULL;
  END;

  -- Extract percentage
  BEGIN
    meta_percent := (NEW.raw_user_meta_data->>'charity_contribution_percentage')::numeric;
    IF meta_percent IS NULL OR meta_percent < 10.00 THEN
      meta_percent := 10.00;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    meta_percent := 10.00;
  END;

  INSERT INTO public.profiles (id, role, full_name, charity_id, charity_contribution_percentage)
  VALUES (
    NEW.id,
    'subscriber'::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    meta_charity_id,
    meta_percent
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
