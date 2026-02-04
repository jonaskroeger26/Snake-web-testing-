-- Run this in Supabase SQL Editor first.
-- Creates the leaderboards table, indexes, and RLS policies.

CREATE TABLE IF NOT EXISTS leaderboards (
  id BIGSERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  skr_name TEXT,
  score INTEGER NOT NULL,
  game_mode TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by mode + difficulty + score
CREATE INDEX IF NOT EXISTS idx_leaderboards_mode_difficulty
  ON leaderboards(game_mode, difficulty, score DESC);

-- Index for lookups by wallet
CREATE INDEX IF NOT EXISTS idx_leaderboards_wallet
  ON leaderboards(wallet_address);

-- Row Level Security
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
DROP POLICY IF EXISTS "Allow public read access" ON leaderboards;
CREATE POLICY "Allow public read access" ON leaderboards
  FOR SELECT USING (true);

-- Allow anyone to insert
DROP POLICY IF EXISTS "Allow public insert access" ON leaderboards;
CREATE POLICY "Allow public insert access" ON leaderboards
  FOR INSERT WITH CHECK (true);
