-- Allow public to view active halls (without phone for unauthenticated)
-- Re-add the public access policy for active halls
DROP POLICY IF EXISTS "Authenticated users can view active halls" ON public.halls;

-- Create policy for everyone to view active halls
CREATE POLICY "Active halls are viewable by everyone"
ON public.halls
FOR SELECT
USING (is_active = true);