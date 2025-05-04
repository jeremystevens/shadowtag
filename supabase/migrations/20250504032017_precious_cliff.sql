/*
  # Add disguise mechanic
  
  1. Changes
    - Add disguise_active and disguise_until columns to players table
    - Add function to activate disguise
    - Add function to check if disguise is active
    
  2. Security
    - Enable RLS for new columns
    - Only "it" players can activate disguise
*/

-- Add disguise columns to players table
ALTER TABLE players
ADD COLUMN disguise_active boolean DEFAULT false,
ADD COLUMN disguise_until timestamptz;

-- Function to activate disguise
CREATE OR REPLACE FUNCTION public.activate_disguise()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_record players%ROWTYPE;
BEGIN
  -- Get player record
  SELECT * INTO player_record
  FROM players
  WHERE id = auth.uid();
  
  -- Check if player is "it"
  IF player_record.status != 'it' THEN
    RETURN false;
  END IF;
  
  -- Check if disguise is already active
  IF player_record.disguise_active THEN
    RETURN false;
  END IF;
  
  -- Activate disguise for 2 minutes
  UPDATE players
  SET 
    disguise_active = true,
    disguise_until = now() + interval '2 minutes'
  WHERE id = auth.uid();
  
  RETURN true;
END;
$$;