/*
  # Add avatar support
  
  1. Changes
    - Add avatar_id column to players table
    - Add avatar_url column to players table
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add avatar columns to players table
ALTER TABLE players
ADD COLUMN avatar_id text,
ADD COLUMN avatar_url text;

-- Update existing players with default avatar
UPDATE players
SET 
  avatar_id = 'ghost',
  avatar_url = 'https://images.pexels.com/photos/1097456/pexels-photo-1097456.jpeg'
WHERE avatar_id IS NULL;