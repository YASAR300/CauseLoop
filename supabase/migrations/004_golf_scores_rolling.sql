-- ============================================================
-- Migration: 004_golf_scores_rolling.sql
-- Add scores: own delete policy and insert_golf_score RPC function
-- ============================================================

-- RLS Policy: Allow users to delete their own scores
DROP POLICY IF EXISTS "scores: own delete" ON scores;
CREATE POLICY "scores: own delete"
  ON scores FOR DELETE
  USING (user_id = auth.uid());

-- RPC Function: Atomic rolling 5-score insertion with validations
CREATE OR REPLACE FUNCTION public.insert_golf_score(
  user_id_param UUID,
  score_value_param INTEGER,
  score_date_param DATE
) RETURNS public.scores AS $$
DECLARE
  inserted_row public.scores;
  score_count INTEGER;
  oldest_id UUID;
BEGIN
  -- 1. Check if the score range is valid (1 to 45)
  IF score_value_param < 1 OR score_value_param > 45 THEN
    RAISE EXCEPTION 'Score must be between 1 and 45';
  END IF;

  -- 2. Check if a score for the given date already exists for this user
  IF EXISTS (
    SELECT 1 FROM public.scores 
    WHERE user_id = user_id_param AND score_date = score_date_param
  ) THEN
    RAISE EXCEPTION 'Duplicate date: A score already exists for date %', score_date_param;
  END IF;

  -- 3. Check the current count of scores for this user
  SELECT COUNT(*) INTO score_count FROM public.scores WHERE user_id = user_id_param;

  -- 4. If there are already 5 or more scores, identify and delete the single oldest one by score_date.
  IF score_count >= 5 THEN
    SELECT id INTO oldest_id FROM public.scores
    WHERE user_id = user_id_param
    ORDER BY score_date ASC, created_at ASC
    LIMIT 1;

    IF oldest_id IS NOT NULL THEN
      DELETE FROM public.scores WHERE id = oldest_id;
    END IF;
  END IF;

  -- 5. Insert the new score
  INSERT INTO public.scores (user_id, score_value, score_date)
  VALUES (user_id_param, score_value_param, score_date_param)
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
