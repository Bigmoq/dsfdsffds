
-- Revert dresses policy to original (no vendor approval needed)
DROP POLICY IF EXISTS "Active dresses are viewable by everyone" ON public.dresses;
CREATE POLICY "Active dresses are viewable by everyone"
ON public.dresses FOR SELECT
USING (is_active = true AND is_sold = false);
