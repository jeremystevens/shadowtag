/*
  # Add player creation policy

  1. Security Changes
    - Add RLS policy to allow new player creation
    - Policy allows any authenticated user to create their own player record
    - Policy ensures player ID matches authenticated user ID
*/

CREATE POLICY "Enable player creation for authenticated users"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure the player ID matches the authenticated user's ID
  auth.uid() = id
);