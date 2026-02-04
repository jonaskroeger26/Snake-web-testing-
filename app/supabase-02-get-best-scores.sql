-- Run this in Supabase SQL Editor after the table exists.
-- Returns the best score per wallet for a given game_mode and difficulty.

CREATE OR REPLACE FUNCTION get_best_scores(
  p_game_mode TEXT,
  p_difficulty TEXT
)
RETURNS TABLE (
  wallet_address TEXT,
  skr_name TEXT,
  best_score INTEGER
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    l.wallet_address,
    l.skr_name,
    MAX(l.score)::INTEGER AS best_score
  FROM leaderboards l
  WHERE l.game_mode = p_game_mode
    AND l.difficulty = p_difficulty
  GROUP BY l.wallet_address, l.skr_name
  ORDER BY best_score DESC
  LIMIT 100;
$$;

-- Let anon (public) call the function
GRANT EXECUTE ON FUNCTION get_best_scores(TEXT, TEXT) TO anon;
