/*
  # Add multiple It players feature
  
  1. Changes
    - Add function to randomly select additional players to become "It"
    - Add trigger to automatically select new "It" players after certain conditions
    - Add column to track if player was selected as additional "It"
  
  2. Security
    - Function runs with security definer to ensure proper access control
    - Only activates when specific game conditions are met
*/

-- Add column to track if player was selected as additional "It"
ALTER TABLE players
ADD COLUMN is_additional_it boolean DEFAULT false;

-- Function to select additional "It" players
CREATE OR REPLACE FUNCTION select_additional_it_players()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_players_count integer;
  current_it_count integer;
  target_it_count integer;
  random_player record;
BEGIN
  -- Get count of active players (not 'out')
  SELECT COUNT(*) INTO active_players_count
  FROM players
  WHERE status != 'out';
  
  -- Get current count of "It" players
  SELECT COUNT(*) INTO current_it_count
  FROM players
  WHERE status = 'it';
  
  -- Calculate target number of "It" players based on active players
  -- 1 "It" per 10 active players, minimum 1, maximum 5
  target_it_count := GREATEST(1, LEAST(5, active_players_count / 10));
  
  -- If we need more "It" players
  WHILE current_it_count < target_it_count LOOP
    -- Select a random neutral player
    SELECT * INTO random_player
    FROM players
    WHERE status = 'neutral'
      AND NOT is_additional_it
    ORDER BY random()
    LIMIT 1;
    
    -- Update the selected player to be "It"
    IF random_player.id IS NOT NULL THEN
      UPDATE players
      SET 
        status = 'it',
        became_it_at = now(),
        is_additional_it = true
      WHERE id = random_player.id;
      
      current_it_count := current_it_count + 1;
    ELSE
      -- No more eligible players to convert
      EXIT;
    END IF;
  END LOOP;
END;
$$;

-- Function to check and trigger additional "It" players
CREATE OR REPLACE FUNCTION check_and_add_it_players()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_duration interval;
  total_tags integer;
BEGIN
  -- Get how long the game has been active
  SELECT now() - MIN(became_it_at) INTO active_duration
  FROM players
  WHERE status = 'it';
  
  -- Get total number of tags
  SELECT COUNT(*) INTO total_tags
  FROM tags;
  
  -- Add more "It" players if:
  -- 1. Game has been active for at least 30 minutes AND
  -- 2. At least 10 tags have occurred
  IF active_duration >= interval '30 minutes' AND total_tags >= 10 THEN
    PERFORM select_additional_it_players();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check for adding "It" players after each tag
CREATE TRIGGER check_additional_it_players
AFTER INSERT ON tags
FOR EACH ROW
EXECUTE FUNCTION check_and_add_it_players();