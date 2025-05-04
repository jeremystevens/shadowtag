/*
  # Add match-based system

  1. New Tables
    - `matches`
      - `id` (uuid, primary key)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `duration` (interval, default 30 minutes)
      - `is_active` (boolean)
      - `winner_id` (uuid, references players)
      - `created_at` (timestamptz)

    - `match_players`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `player_id` (uuid, references players)
      - `status` (player_status)
      - `points` (integer)
      - `tags` (integer)
      - `dodges` (integer)
      - `survival_time` (interval)
      - `is_mvp` (boolean)
      - `joined_at` (timestamptz)
      - `eliminated_at` (timestamptz)

  2. Functions
    - `start_match()`: Creates a new match and assigns initial "It" player
    - `end_match()`: Ends current match and calculates final scores
    - `check_match_status()`: Checks win conditions and time limits
    - `calculate_match_points()`: Calculates points for tags, dodges, and survival

  3. Triggers
    - Auto-end match when win conditions are met
    - Update player points on match events
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration interval NOT NULL DEFAULT interval '30 minutes',
  is_active boolean NOT NULL DEFAULT true,
  winner_id uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create match_players table
CREATE TABLE IF NOT EXISTS match_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  player_id uuid REFERENCES players(id) NOT NULL,
  status player_status NOT NULL DEFAULT 'neutral',
  points integer NOT NULL DEFAULT 0,
  tags integer NOT NULL DEFAULT 0,
  dodges integer NOT NULL DEFAULT 0,
  survival_time interval,
  is_mvp boolean DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  eliminated_at timestamptz,
  
  -- Each player can only join a match once
  UNIQUE(match_id, player_id)
);

-- Enable RLS on match_players
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read match players"
  ON match_players
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to start a new match
CREATE OR REPLACE FUNCTION start_match()
RETURNS matches
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_match matches%ROWTYPE;
  initial_it_player uuid;
BEGIN
  -- End any active matches
  UPDATE matches
  SET 
    is_active = false,
    ended_at = now()
  WHERE is_active = true;
  
  -- Create new match
  INSERT INTO matches (started_at, is_active)
  VALUES (now(), true)
  RETURNING * INTO new_match;
  
  -- Select random player to be "It"
  SELECT id INTO initial_it_player
  FROM players
  WHERE status != 'out'
  ORDER BY random()
  LIMIT 1;
  
  -- Add all active players to match
  INSERT INTO match_players (match_id, player_id, status)
  SELECT 
    new_match.id,
    id,
    CASE 
      WHEN id = initial_it_player THEN 'it'::player_status
      ELSE 'neutral'::player_status
    END
  FROM players
  WHERE status != 'out';
  
  -- Update player statuses
  UPDATE players
  SET 
    status = CASE 
      WHEN id = initial_it_player THEN 'it'
      ELSE 'neutral'
    END,
    became_it_at = CASE 
      WHEN id = initial_it_player THEN now()
      ELSE null
    END
  WHERE status != 'out';
  
  RETURN new_match;
END;
$$;

-- Function to end match
CREATE OR REPLACE FUNCTION end_match(match_id uuid)
RETURNS matches
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  match_record matches%ROWTYPE;
  winner_player_id uuid;
BEGIN
  -- Get match record
  SELECT * INTO match_record
  FROM matches
  WHERE id = match_id;
  
  -- Find winner (last neutral player)
  SELECT player_id INTO winner_player_id
  FROM match_players
  WHERE match_id = match_record.id
    AND status = 'neutral'
  LIMIT 1;
  
  -- Update match
  UPDATE matches
  SET 
    is_active = false,
    ended_at = now(),
    winner_id = winner_player_id
  WHERE id = match_record.id
  RETURNING * INTO match_record;
  
  -- Calculate survival time for all players
  UPDATE match_players
  SET survival_time = 
    CASE 
      WHEN eliminated_at IS NOT NULL THEN
        eliminated_at - joined_at
      ELSE
        match_record.ended_at - joined_at
    END
  WHERE match_id = match_record.id;
  
  -- Select MVP based on points
  UPDATE match_players
  SET is_mvp = true
  WHERE id = (
    SELECT id
    FROM match_players
    WHERE match_id = match_record.id
    ORDER BY points DESC
    LIMIT 1
  );
  
  RETURN match_record;
END;
$$;

-- Function to check match status
CREATE OR REPLACE FUNCTION check_match_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_match matches%ROWTYPE;
  neutral_count integer;
BEGIN
  -- Get current active match
  SELECT * INTO active_match
  FROM matches
  WHERE is_active = true
  LIMIT 1;
  
  IF active_match IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Count neutral players
  SELECT COUNT(*) INTO neutral_count
  FROM match_players
  WHERE match_id = active_match.id
    AND status = 'neutral';
  
  -- End match if:
  -- 1. Only one neutral player remains OR
  -- 2. Match duration has elapsed
  IF neutral_count <= 1 OR now() > active_match.started_at + active_match.duration THEN
    PERFORM end_match(active_match.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check match status after player status changes
CREATE TRIGGER check_match_status_trigger
AFTER UPDATE OF status ON match_players
FOR EACH ROW
EXECUTE FUNCTION check_match_status();

-- Function to calculate match points
CREATE OR REPLACE FUNCTION calculate_match_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Points system:
  -- Tag: 100 points
  -- Dodge: 50 points
  -- Survival bonus: 10 points per minute
  UPDATE match_players
  SET points = 
    (tags * 100) +
    (dodges * 50) +
    (EXTRACT(EPOCH FROM survival_time) / 60 * 10)::integer
  WHERE match_id = NEW.match_id
    AND player_id = NEW.player_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update points
CREATE TRIGGER calculate_match_points_trigger
AFTER UPDATE OF tags, dodges, survival_time ON match_players
FOR EACH ROW
EXECUTE FUNCTION calculate_match_points();