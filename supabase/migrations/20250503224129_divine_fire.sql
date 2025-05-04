/*
  # Update seasons table and policies

  1. Changes
    - Create seasons table if it doesn't exist
    - Recreate unique index for active seasons
    - Update RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for read access and admin management
*/

-- Create seasons table if it doesn't exist
CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Drop the index if it exists and recreate it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'seasons_active_unique'
  ) THEN
    DROP INDEX seasons_active_unique;
  END IF;
END $$;

-- Create a unique index to ensure only one active season at a time
CREATE UNIQUE INDEX seasons_active_unique ON seasons (is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read seasons data" ON seasons;
  DROP POLICY IF EXISTS "Admins can manage seasons" ON seasons;
END $$;

-- Allow all authenticated users to read seasons data
CREATE POLICY "Anyone can read seasons data"
  ON seasons
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow admins to manage seasons
CREATE POLICY "Admins can manage seasons"
  ON seasons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = auth.uid()
      AND players.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = auth.uid()
      AND players.is_admin = true
    )
  );