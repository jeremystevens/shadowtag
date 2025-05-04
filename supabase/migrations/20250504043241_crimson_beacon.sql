/*
  # Add Region-Based Matchmaking
  
  1. Changes
    - Add region fields to matches table
    - Add function to find or create regional match
    - Add function to calculate region from coordinates
    - Update match assignment logic
  
  2. Security
    - Maintain existing RLS policies
    - Add region-based filtering
*/

-- Add region fields to matches table
ALTER TABLE matches
ADD COLUMN region_lat numeric,
ADD COLUMN region_lng numeric,
ADD COLUMN region_name text;

-- Function to calculate region name from coordinates
CREATE OR REPLACE FUNCTION calculate_region_name(
  lat numeric,
  lng numeric
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  region_size numeric = 0.01; -- Roughly 1km grid size
  lat_grid numeric;
  lng_grid numeric;
BEGIN
  -- Round coordinates to grid
  lat_grid = round(lat / region_size) * region_size;
  lng_grid = round(lng / region_size) * region_size;
  
  -- Return grid identifier
  RETURN format('Region %s,%s', lat_grid, lng_grid);
END;
$$;

-- Function to find or create regional match
CREATE OR REPLACE FUNCTION find_or_create_regional_match(
  player_lat numeric,
  player_lng numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  region_size numeric = 0.01; -- Roughly 1km grid size
  region_lat numeric;
  region_lng numeric;
  region_name text;
  existing_match_id uuid;
  new_match_id uuid;
BEGIN
  -- Calculate region coordinates
  region_lat = round(player_lat / region_size) * region_size;
  region_lng = round(player_lng / region_size) * region_size;
  region_name = calculate_region_name(player_lat, player_lng);
  
  -- Look for active match in region
  SELECT id INTO existing_match_id
  FROM matches
  WHERE is_active = true
    AND region_lat = round(player_lat / region_size) * region_size
    AND region_lng = round(player_lng / region_size) * region_size
    AND started_at > now() - interval '30 minutes'
  LIMIT 1;
  
  -- Return existing match if found
  IF existing_match_id IS NOT NULL THEN
    RETURN existing_match_id;
  END IF;
  
  -- Create new match for region
  INSERT INTO matches (
    region_lat,
    region_lng,
    region_name,
    started_at,
    duration,
    is_active
  )
  VALUES (
    region_lat,
    region_lng,
    region_name,
    now(),
    interval '30 minutes',
    true
  )
  RETURNING id INTO new_match_id;
  
  RETURN new_match_id;
END;
$$;

-- Function to join regional match
CREATE OR REPLACE FUNCTION join_regional_match(
  player_id uuid,
  player_lat numeric,
  player_lng numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_id uuid;
  match_record matches%ROWTYPE;
  player_count integer;
  should_be_it boolean;
BEGIN
  -- Find or create match for player's region
  match_id := find_or_create_regional_match(player_lat, player_lng);
  
  -- Get match details
  SELECT * INTO match_record
  FROM matches
  WHERE id = match_id;
  
  -- Count current players
  SELECT COUNT(*) INTO player_count
  FROM match_players
  WHERE match_id = match_record.id;
  
  -- Determine if player should be "it" (first player or random chance)
  should_be_it := (player_count = 0) OR (random() < 0.1 AND player_count < 10);
  
  -- Add player to match
  INSERT INTO match_players (
    match_id,
    player_id,
    status,
    joined_at
  )
  VALUES (
    match_record.id,
    player_id,
    CASE WHEN should_be_it THEN 'it'::player_status ELSE 'neutral'::player_status END,
    now()
  );
  
  -- Update player status
  UPDATE players
  SET 
    status = CASE WHEN should_be_it THEN 'it'::player_status ELSE 'neutral'::player_status END,
    became_it_at = CASE WHEN should_be_it THEN now() ELSE null END
  WHERE id = player_id;
  
  RETURN jsonb_build_object(
    'match_id', match_record.id,
    'region_name', match_record.region_name,
    'is_it', should_be_it
  );
END;
$$;