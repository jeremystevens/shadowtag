/*
  # Create players and tags tables

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `codename` (text, unique)
      - `status` (player_status enum)
      - `joined_at` (timestamptz)
      - `last_tagged_at` (timestamptz, nullable)
      - `became_it_at` (timestamptz, nullable)
      - `tag_streak` (integer)
      - `total_tags` (integer)
      - `is_admin` (boolean)
      - `location` (jsonb, nullable)

    - `tags`
      - `id` (uuid, primary key)
      - `tagger_id` (uuid, references players)
      - `tagged_id` (uuid, references players)
      - `location` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading and creating tags
    - Add policies for player data access
*/

-- Create player status enum
CREATE TYPE player_status AS ENUM ('neutral', 'it', 'out');

-- Create players table
CREATE TABLE IF NOT EXISTS public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codename text UNIQUE NOT NULL,
  status player_status NOT NULL DEFAULT 'neutral',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_tagged_at timestamptz,
  became_it_at timestamptz,
  tag_streak integer NOT NULL DEFAULT 0,
  total_tags integer NOT NULL DEFAULT 0,
  is_admin boolean NOT NULL DEFAULT false,
  location jsonb,
  
  -- Ensure location has required fields when present
  CONSTRAINT valid_location CHECK (
    location IS NULL OR (
      location ? 'lat' AND 
      location ? 'lng' AND
      (location->>'lat')::numeric BETWEEN -90 AND 90 AND
      (location->>'lng')::numeric BETWEEN -180 AND 180
    )
  )
);

-- Enable RLS on players
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Players can read all player data
CREATE POLICY "Players can read all player data"
  ON public.players
  FOR SELECT
  TO authenticated
  USING (true);

-- Players can update their own data
CREATE POLICY "Players can update own data"
  ON public.players
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tagger_id uuid NOT NULL REFERENCES public.players(id),
  tagged_id uuid NOT NULL REFERENCES public.players(id),
  location jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure location has required fields
  CONSTRAINT valid_location CHECK (
    location ? 'lat' AND 
    location ? 'lng' AND
    (location->>'lat')::numeric BETWEEN -90 AND 90 AND
    (location->>'lng')::numeric BETWEEN -180 AND 180
  )
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read tags
CREATE POLICY "Anyone can read tags"
  ON public.tags
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow players who are "it" to create tags
CREATE POLICY "Players who are it can create tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players
      WHERE id = auth.uid()
      AND status = 'it'
    )
  );

-- Create index for faster queries
CREATE INDEX tags_created_at_idx ON public.tags(created_at DESC);