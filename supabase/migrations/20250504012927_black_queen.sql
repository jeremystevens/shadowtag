/*
  # Add location tracking functionality
  
  1. Changes
    - Add last_location_update column to players table
    - Create get_nearby_players function
    - Add PostGIS extension for location calculations
  
  2. Security
    - Function is accessible to authenticated users
*/

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add last_location_update column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS last_location_update timestamptz;

-- Create function to get nearby players
CREATE OR REPLACE FUNCTION get_nearby_players(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  codename text,
  status player_status,
  location jsonb,
  distance_meters double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.codename,
    p.status,
    p.location,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(
        (p.location->>'lng')::float,
        (p.location->>'lat')::float
      ), 4326)::geography
    ) as distance_meters
  FROM players p
  WHERE 
    p.location IS NOT NULL
    AND p.last_location_update > now() - interval '5 minutes'
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(
        (p.location->>'lng')::float,
        (p.location->>'lat')::float
      ), 4326)::geography,
      radius_meters
    )
    AND p.id != auth.uid()  -- Exclude the current user
  ORDER BY distance_meters ASC;
END;
$$;