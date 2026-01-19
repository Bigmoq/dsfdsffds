-- Fix the halls policy - the previous migration added a duplicate
-- Drop the old policy if it wasn't dropped
DROP POLICY IF EXISTS "Halls are viewable by everyone" ON public.halls;

-- Drop the new policy we created to recreate it correctly
DROP POLICY IF EXISTS "Authenticated users can view active halls" ON public.halls;

-- Create the correct policy for authenticated users to view halls (including phone)
CREATE POLICY "Authenticated users can view active halls"
ON public.halls
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);