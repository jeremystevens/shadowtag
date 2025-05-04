/*
  # Add Mystery Roles

  1. New Fields
    - Add mystery_role to players table
    - Add role_revealed_at to track when a role was last used
    - Add role_cooldown to manage power usage

  2. New Types
    - Create mystery_role enum for different role types
    
  3. Functions
    - Add functions to handle role-specific actions
*/

-- Create mystery role enum
CREATE TYPE mystery_role AS ENUM (
  'none',
  'tracker',
  'decoy',
  'mole'
);

-- Add mystery role fields to players table
ALTER TABLE players
ADD COLUMN mystery_role mystery_role DEFAULT 'none',
ADD COLUMN role_revealed_at timestamptz,
ADD COLUMN role_cooldown interval DEFAULT '24 hours'::interval;

-- Function to use tracker ability
CREATE OR REPLACE FUNCTION use_tracker_ability()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  it_player_location jsonb;
BEGIN
  -- Check if user is tracker and hasn't used ability recently
  IF NOT EXISTS (
    SELECT 1 FROM players
    WHERE id = auth.uid()
    AND mystery_role = 'tracker'
    AND (
      role_revealed_at IS NULL
      OR role_revealed_at < now() - role_cooldown
    )
  ) THEN
    RETURN NULL;
  END IF;

  -- Get the location of the current "it" player
  SELECT location INTO it_player_location
  FROM players
  WHERE status = 'it'
  ORDER BY became_it_at DESC
  LIMIT 1;

  -- Update tracker's revealed timestamp
  UPDATE players
  SET role_revealed_at = now()
  WHERE id = auth.uid();

  RETURN it_player_location;
END;
$$;

-- Function to use decoy ability
CREATE OR REPLACE FUNCTION use_decoy_ability()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is decoy and hasn't used ability recently
  IF NOT EXISTS (
    SELECT 1 FROM players
    WHERE id = auth.uid()
    AND mystery_role = 'decoy'
    AND (
      role_revealed_at IS NULL
      OR role_revealed_at < now() - role_cooldown
    )
  ) THEN
    RETURN false;
  END IF;

  -- Update decoy's revealed timestamp
  UPDATE players
  SET role_revealed_at = now()
  WHERE id = auth.uid();

  RETURN true;
END;
$$;

-- Function to assign random mystery roles
CREATE OR REPLACE FUNCTION assign_mystery_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_players integer;
  tracker_count integer;
  decoy_count integer;
  mole_count integer;
BEGIN
  -- Get total active players
  SELECT COUNT(*) INTO total_players
  FROM players
  WHERE status != 'out';

  -- Calculate number of each role (roughly 10% of players for each role)
  tracker_count := GREATEST(1, total_players / 10);
  decoy_count := GREATEST(1, total_players / 10);
  mole_count := GREATEST(1, total_players / 10);

  -- Reset all roles
  UPDATE players SET mystery_role = 'none';

  -- Assign tracker roles
  UPDATE players
  SET mystery_role = 'tracker'
  WHERE id IN (
    SELECT id FROM players
    WHERE status != 'out'
    ORDER BY RANDOM()
    LIMIT tracker_count
  );

  -- Assign decoy roles
  UPDATE players
  SET mystery_role = 'decoy'
  WHERE id IN (
    SELECT id FROM players
    WHERE status != 'out'
    AND mystery_role = 'none'
    ORDER BY RANDOM()
    LIMIT decoy_count
  );

  -- Assign mole roles
  UPDATE players
  SET mystery_role = 'mole'
  WHERE id IN (
    SELECT id FROM players
    WHERE status != 'out'
    AND mystery_role = 'none'
    ORDER BY RANDOM()
    LIMIT mole_count
  );
END;
$$;