/*
  # Add seasons table for game rounds management

  1. New Tables
    - `seasons`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, not null)
      - `is_active` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `seasons` table
    - Add policies for:
      - Everyone can read seasons data
      - Only admins can create/update/delete seasons
*/

CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Everyone can read seasons data
CREATE POLICY "Anyone can read seasons data"
  ON seasons
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage seasons
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

-- Add constraint to ensure only one active season at a time
CREATE UNIQUE INDEX seasons_active_unique ON seasons (is_active) WHERE is_active = true;