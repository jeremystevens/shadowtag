/*
  # Add Bait Pings Feature

  1. New Tables
    - `bait_pings`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references players)
      - `location` (jsonb)
      - `created_at` (timestamp)

  2. New Functions
    - `create_bait_ping`: Creates a new bait ping for a player
      - Parameters:
        - player_id (uuid)
        - ping_location (jsonb)
      - Returns: The created bait ping record

  3. Security
    - Enable RLS on `bait_pings` table
    - Add policies for:
      - Insert: Only authenticated users can create their own bait pings
      - Select: All authenticated users can read bait pings
*/

-- Create bait_pings table
CREATE TABLE IF NOT EXISTS bait_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  location jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Validate location format
  CONSTRAINT valid_location CHECK (
    (location ? 'lat') AND 
    (location ? 'lng') AND 
    ((location->>'lat')::numeric >= -90) AND 
    ((location->>'lat')::numeric <= 90) AND
    ((location->>'lng')::numeric >= -180) AND 
    ((location->>'lng')::numeric <= 180)
  )
);

-- Enable RLS
ALTER TABLE bait_pings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can create their own bait pings"
  ON bait_pings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can read all bait pings"
  ON bait_pings
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to handle bait ping creation
CREATE OR REPLACE FUNCTION public.create_bait_ping(
  player_id uuid,
  ping_location jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Insert the bait ping
  INSERT INTO bait_pings (player_id, location)
  VALUES (player_id, ping_location)
  RETURNING jsonb_build_object(
    'id', id,
    'player_id', player_id,
    'location', location,
    'created_at', created_at
  ) INTO result;

  RETURN result;
END;
$$;