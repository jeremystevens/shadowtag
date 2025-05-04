/*
  # Add Game Mechanics
  
  1. Player Updates
    - Add points field
    - Add dodge_count field
    - Add last_dodge_at field
    - Add power_ups field
  
  2. New Tables
    - dodges table to track dodge attempts
    - power_ups table to track available power-ups
  
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Update players table with new fields
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS dodge_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_dodge_at timestamptz,
ADD COLUMN IF NOT EXISTS power_ups jsonb DEFAULT '{"extra_dodge": false, "shadow_cloak": false, "reverse_tag": false}'::jsonb;

-- Create dodges table
CREATE TABLE IF NOT EXISTS dodges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id),
  dodged_player_id uuid NOT NULL REFERENCES players(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  location jsonb NOT NULL,
  
  CONSTRAINT valid_location CHECK (
    location ? 'lat' AND 
    location ? 'lng' AND
    (location->>'lat')::numeric BETWEEN -90 AND 90 AND
    (location->>'lng')::numeric BETWEEN -180 AND 180
  )
);

-- Enable RLS on dodges
ALTER TABLE dodges ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read dodges
CREATE POLICY "Anyone can read dodges"
  ON dodges
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow players to create their own dodges
CREATE POLICY "Players can create own dodges"
  ON dodges
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

-- Create function to handle dodge mechanics
CREATE OR REPLACE FUNCTION handle_dodge(
  dodging_player_id uuid,
  dodged_player_id uuid,
  dodge_location jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_dodge timestamptz;
  can_dodge boolean;
BEGIN
  -- Get player's last dodge time
  SELECT last_dodge_at INTO last_dodge
  FROM players
  WHERE id = dodging_player_id;
  
  -- Check if player can dodge (8 hour cooldown)
  can_dodge := last_dodge IS NULL OR 
               (EXTRACT(EPOCH FROM (now() - last_dodge)) >= 28800);
  
  IF can_dodge THEN
    -- Update player's dodge status
    UPDATE players
    SET 
      last_dodge_at = now(),
      dodge_count = dodge_count + 1,
      points = points + 75  -- Award points for successful dodge
    WHERE id = dodging_player_id;
    
    -- Record the dodge
    INSERT INTO dodges (player_id, dodged_player_id, location)
    VALUES (dodging_player_id, dodged_player_id, dodge_location);
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update tag_player function to handle points and dodges
CREATE OR REPLACE FUNCTION tag_player(
  tagger_id uuid,
  tagged_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tagger_status player_status;
  tagged_status player_status;
  tagger_streak integer;
  is_dodging boolean;
BEGIN
  -- Get current statuses
  SELECT status, tag_streak INTO tagger_status, tagger_streak
  FROM players WHERE id = tagger_id;
  
  SELECT status INTO tagged_status
  FROM players WHERE id = tagged_id;
  
  -- Check if tagged player is dodging
  SELECT (last_dodge_at > now() - interval '2 minutes') INTO is_dodging
  FROM players WHERE id = tagged_id;
  
  -- Handle dodge case
  IF is_dodging THEN
    -- Apply tag cooldown to tagger
    UPDATE players
    SET last_tagged_at = now()
    WHERE id = tagger_id;
    
    RETURN false;
  END IF;
  
  -- Proceed with normal tag
  IF tagger_status = 'it' AND tagged_status = 'neutral' THEN
    -- Update tagged player
    UPDATE players
    SET 
      status = 'it',
      became_it_at = now(),
      points = points - 50  -- Penalty for being tagged
    WHERE id = tagged_id;
    
    -- Update tagger
    UPDATE players
    SET 
      status = 'neutral',
      tag_streak = tag_streak + 1,
      total_tags = total_tags + 1,
      points = points + 100 + (CASE WHEN tag_streak >= 2 THEN 50 ELSE 0 END)  -- Base points + streak bonus
    WHERE id = tagger_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;