/*
  # Clear Game Data
  
  1. Changes
    - Safely remove all game data while preserving table structures
    - Handle deletions in correct order to respect foreign key constraints
    - Use DELETE instead of TRUNCATE to avoid system trigger issues
  
  2. Security
    - Maintains referential integrity
    - Preserves table structures and policies
*/

-- Clear game data in correct order to respect foreign key constraints
DELETE FROM match_players;
DELETE FROM matches;
DELETE FROM tags;
DELETE FROM dodges;
DELETE FROM whispers;
DELETE FROM bait_pings;
DELETE FROM flash_events;
DELETE FROM players;

-- Reset sequences if needed
ALTER SEQUENCE IF EXISTS match_players_id_seq RESTART;
ALTER SEQUENCE IF EXISTS matches_id_seq RESTART;
ALTER SEQUENCE IF EXISTS tags_id_seq RESTART;
ALTER SEQUENCE IF EXISTS dodges_id_seq RESTART;
ALTER SEQUENCE IF EXISTS whispers_id_seq RESTART;
ALTER SEQUENCE IF EXISTS bait_pings_id_seq RESTART;
ALTER SEQUENCE IF EXISTS flash_events_id_seq RESTART;
ALTER SEQUENCE IF EXISTS players_id_seq RESTART;