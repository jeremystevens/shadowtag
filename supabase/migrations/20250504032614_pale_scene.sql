/*
  # Add Flash Events System

  1. New Tables
    - `flash_events`
      - `id` (uuid, primary key)
      - `type` (event_type enum)
      - `started_at` (timestamp)
      - `ends_at` (timestamp)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Changes
    - Add event_type enum
    - Add flash event trigger function
    - Add policies for flash events table

  3. Security
    - Enable RLS on flash_events table
    - Add policy for reading flash events
*/

-- Create event type enum
CREATE TYPE event_type AS ENUM (
  'double_tag',    -- Tag 2 people, double points
  'silent_mode',   -- No radar for 10 minutes
  'tag_reversal'   -- Last person tagged becomes "It" again
);

-- Create flash events table
CREATE TABLE IF NOT EXISTS flash_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type event_type NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE flash_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read flash events"
  ON flash_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to handle double tag points
CREATE OR REPLACE FUNCTION handle_double_tag_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if there's an active double tag event
  IF EXISTS (
    SELECT 1 FROM flash_events
    WHERE type = 'double_tag'
      AND is_active = true
      AND now() BETWEEN started_at AND ends_at
  ) THEN
    -- Double the points for this tag
    UPDATE players
    SET points = points + 200  -- Normal tag is 100 points
    WHERE id = NEW.tagger_id;
  ELSE
    -- Normal points
    UPDATE players
    SET points = points + 100
    WHERE id = NEW.tagger_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for double tag points
CREATE TRIGGER handle_double_tag_points_trigger
AFTER INSERT ON tags
FOR EACH ROW
EXECUTE FUNCTION handle_double_tag_points();

-- Function to create a random flash event
CREATE OR REPLACE FUNCTION create_random_flash_event()
RETURNS flash_events
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_duration interval;
  new_event flash_events%ROWTYPE;
  random_type event_type;
BEGIN
  -- Select random event type
  SELECT unnest(enum_range(NULL::event_type))
  INTO random_type
  FROM (
    SELECT unnest(enum_range(NULL::event_type))
    ORDER BY random()
    LIMIT 1
  ) AS random_event;

  -- Set duration based on event type
  CASE random_type
    WHEN 'double_tag' THEN
      event_duration := interval '1 hour';
    WHEN 'silent_mode' THEN
      event_duration := interval '10 minutes';
    WHEN 'tag_reversal' THEN
      event_duration := interval '30 minutes';
    ELSE
      event_duration := interval '30 minutes';
  END CASE;

  -- Create new event
  INSERT INTO flash_events (
    type,
    started_at,
    ends_at
  )
  VALUES (
    random_type,
    now(),
    now() + event_duration
  )
  RETURNING * INTO new_event;

  RETURN new_event;
END;
$$;