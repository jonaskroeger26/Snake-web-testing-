# Supabase leaderboard schema and RPC

Run these in the **Supabase SQL Editor** to create/update the leaderboard table and the best-scores function.

## Table and indexes

```sql
CREATE TABLE leaderboards (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  skr_name TEXT,
  score INTEGER NOT NULL,
  game_mode TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX idx_leaderboards_mode_difficulty ON leaderboards(game_mode, difficulty, score DESC);
CREATE INDEX idx_leaderboards_wallet ON leaderboards(wallet_address);

-- Row Level Security (optional)
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON leaderboards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON leaderboards
  FOR INSERT WITH CHECK (true);
```

## Best score per wallet (RPC)

Shows only the **best score per wallet** for each mode + difficulty.

```sql
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
AS $$
    SELECT 
        l.wallet_address,
        l.skr_name,
        MAX(l.score) as best_score
    FROM leaderboards l
    WHERE l.game_mode = p_game_mode 
    AND l.difficulty = p_difficulty
    GROUP BY l.wallet_address, l.skr_name
    ORDER BY best_score DESC
    LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION get_best_scores(TEXT, TEXT) TO anon;
```

## Frontend usage

- **Insert:** `wallet_address`, `skr_name`, `score` (1 per apple, e.g. 5 apples → 5), `game_mode`, `difficulty`.
- **Read:** `supabase.rpc('get_best_scores', { p_game_mode, p_difficulty })` → rows with `wallet_address`, `skr_name`, `best_score`.
- **Display:** In-game and leaderboard show **1 point per apple**. Leaderboard uses `scoreToApples(s)` so old rows stored ×10 still display correctly (s ≥ 10 → s/10).
