/*
  # Update player creation policy
  
  1. Changes
    - Safely create player creation policy if it doesn't exist
    
  2. Security
    - Maintains RLS policy for authenticated users to create their own player records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'players' 
    AND policyname = 'Enable player creation for authenticated users'
  ) THEN
    CREATE POLICY "Enable player creation for authenticated users"
    ON public.players
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;