
-- Function to check if vendor is approved
CREATE OR REPLACE FUNCTION public.is_vendor_approved(vendor_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendor_applications
    WHERE user_id = vendor_user_id AND status = 'approved'
  )
$$;

-- Update halls public SELECT policy
DROP POLICY IF EXISTS "Active halls are viewable by everyone" ON public.halls;
CREATE POLICY "Active halls are viewable by everyone"
ON public.halls FOR SELECT
USING (is_active = true AND is_vendor_approved(owner_id));

-- Update service_providers public SELECT policy
DROP POLICY IF EXISTS "Service providers are viewable by everyone" ON public.service_providers;
CREATE POLICY "Service providers are viewable by everyone"
ON public.service_providers FOR SELECT
USING (is_active = true AND is_vendor_approved(owner_id));

-- Update dresses public SELECT policy
DROP POLICY IF EXISTS "Active dresses are viewable by everyone" ON public.dresses;
CREATE POLICY "Active dresses are viewable by everyone"
ON public.dresses FOR SELECT
USING (is_active = true AND is_sold = false AND is_vendor_approved(seller_id));
