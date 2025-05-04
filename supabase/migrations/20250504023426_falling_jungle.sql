/*
  # Add whispers functionality
  
  1. New Tables
    - `whispers`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references players)
      - `receiver_id` (uuid, references players)
      - `message` (text)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `whispers` table
    - Add policies for creating and reading whispers
    - Limit whisper creation to one per player per season
*/

-- Create whispers table
CREATE TABLE IF NOT EXISTS whispers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES players(id) NOT NULL,
  receiver_id uuid REFERENCES players(id) NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  -- Validate message length
  CONSTRAINT valid_message CHECK (
    length(message) >= 1 AND
    length(message) <= 100
  )
);

-- Enable RLS
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can create whispers"
  ON whispers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    -- Check if player has already used their whisper
    NOT EXISTS (
      SELECT 1 FROM whispers w
      WHERE w.sender_id = auth.uid()
    )
  );

CREATE POLICY "Players can read whispers sent to them"
  ON whispers
  FOR SELECT
  TO authenticated
  USING (
    receiver_id = auth.uid()
  );

-- Create function to send whisper
CREATE OR REPLACE FUNCTION public.send_whisper(
  receiver_id uuid,
  message text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_id uuid;
  result jsonb;
BEGIN
  -- Get sender ID from auth context
  sender_id := auth.uid();
  
  -- Check if sender has already used their whisper
  IF EXISTS (
    SELECT 1 FROM whispers
    WHERE whispers.sender_id = sender_id
  ) THEN
    RAISE EXCEPTION 'You have already used your whisper for this season';
  END IF;
  
  -- Insert the whisper
  INSERT INTO whispers (sender_id, receiver_id, message)
  VALUES (sender_id, receiver_id, message)
  RETURNING jsonb_build_object(
    'id', id,
    'sender_id', sender_id,
    'receiver_id', receiver_id,
    'message', message,
    'created_at', created_at
  ) INTO result;
  
  RETURN result;
END;
$$;