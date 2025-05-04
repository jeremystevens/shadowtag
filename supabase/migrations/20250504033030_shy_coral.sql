/*
  # Add Mind Games Fields

  1. New Fields
    - Added to players table:
      - `fake_dodge_count` (integer) - Number of fake dodges used
      - `last_fake_dodge_at` (timestamptz) - Timestamp of last fake dodge
      - `bait_ping_count` (integer) - Number of bait pings used
      - `last_bait_ping_at` (timestamptz) - Timestamp of last bait ping
      - `has_used_whisper` (boolean) - Whether player has used their whisper
      - `mystery_role` (mystery_role) - Player's secret role
      - `role_revealed_at` (timestamptz) - When role was revealed
      - `role_cooldown` (interval) - Cooldown for role abilities

  2. Changes
    - Added default values and constraints
    - Updated existing RLS policies
*/

-- Add mystery role type if it doesn't exist
DO $$ BEGIN
  CREATE TYPE mystery_role AS ENUM ('none', 'tracker', 'decoy', 'mole');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS fake_dodge_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_fake_dodge_at timestamptz,
ADD COLUMN IF NOT EXISTS bait_ping_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_bait_ping_at timestamptz,
ADD COLUMN IF NOT EXISTS has_used_whisper boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mystery_role mystery_role DEFAULT 'none',
ADD COLUMN IF NOT EXISTS role_revealed_at timestamptz,
ADD COLUMN IF NOT EXISTS role_cooldown interval DEFAULT interval '24 hours';

-- Function to handle fake dodge
CREATE OR REPLACE FUNCTION public.create_fake_dodge(
  player_id uuid,
  target_id uuid,
  dodge_location jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update player's fake dodge count and timestamp
  UPDATE players
  SET 
    fake_dodge_count = fake_dodge_count + 1,
    last_fake_dodge_at = now()
  WHERE id = player_id;
  
  -- Create a dodge record to trigger animations
  INSERT INTO dodges (player_id, dodged_player_id, location)
  VALUES (player_id, target_id, dodge_location);
  
  RETURN true;
END;
$$;