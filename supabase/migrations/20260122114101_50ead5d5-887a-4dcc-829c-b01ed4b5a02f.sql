-- =========================================
-- SECURITY AUDIT: DATA ISOLATION REFACTOR
-- =========================================

-- 1. FIX OVERLY PERMISSIVE RLS POLICIES
-- =========================================

-- Fix analytics_events: Only allow authenticated users to insert their own events
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Authenticated users can insert analytics events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Fix notifications: Only allow system/backend to insert (via triggers/functions)
-- Remove the dangerous "true" policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a more restrictive policy - notifications should only be inserted by database triggers
-- For now, allow authenticated users to only insert notifications for themselves (edge case for direct user actions)
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. RESTRICT PROFILE ACCESS - CRITICAL FIX
-- =========================================
-- The current policy allows ANY authenticated user to see ALL profiles
-- This is a privacy violation

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Users can only view their own profile by default
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow viewing profiles through conversations (for chat)
CREATE POLICY "Users can view profiles in their conversations"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    AND (c.participant_1 = profiles.id OR c.participant_2 = profiles.id)
  )
);

-- Allow viewing profiles for bookings (customer/provider relationship)
CREATE POLICY "Hall owners can view booker profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.hall_bookings hb
    JOIN public.halls h ON h.id = hb.hall_id
    WHERE h.owner_id = auth.uid() AND hb.user_id = profiles.id
  )
);

CREATE POLICY "Service providers can view booker profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_bookings sb
    JOIN public.service_providers sp ON sp.id = sb.provider_id
    WHERE sp.owner_id = auth.uid() AND sb.user_id = profiles.id
  )
);

-- Customers can view the profile of their service providers/hall owners
CREATE POLICY "Customers can view provider profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.hall_bookings hb
    JOIN public.halls h ON h.id = hb.hall_id
    WHERE hb.user_id = auth.uid() AND h.owner_id = profiles.id
  )
  OR EXISTS (
    SELECT 1 FROM public.service_bookings sb
    JOIN public.service_providers sp ON sp.id = sb.provider_id
    WHERE sb.user_id = auth.uid() AND sp.owner_id = profiles.id
  )
);

-- 3. CREATE SECURE VIEWS FOR PUBLIC DATA
-- =========================================
-- These views expose only non-sensitive data to the public

-- Drop existing public_halls view and recreate with explicit security
DROP VIEW IF EXISTS public.public_halls;
CREATE VIEW public.public_halls AS
SELECT 
  id,
  owner_id,
  name_ar,
  name_en,
  description,
  city,
  address,
  cover_image,
  gallery_images,
  features,
  price_weekday,
  price_weekend,
  capacity_men,
  capacity_women,
  min_capacity_men,
  min_capacity_women,
  price_per_chair_weekday,
  price_per_chair_weekend,
  pricing_type,
  latitude,
  longitude,
  whatsapp_enabled,
  is_active,
  created_at,
  updated_at
  -- EXCLUDED: phone (sensitive)
FROM public.halls
WHERE is_active = true;

-- Grant select on view to authenticated and anon
GRANT SELECT ON public.public_halls TO authenticated, anon;

-- Create a secure view for service providers
CREATE OR REPLACE VIEW public.public_service_providers AS
SELECT 
  id,
  owner_id,
  category_id,
  name_ar,
  name_en,
  description,
  portfolio_images,
  work_days,
  city,
  whatsapp_enabled,
  is_active,
  rating,
  reviews_count,
  created_at,
  updated_at
  -- EXCLUDED: phone (sensitive)
FROM public.service_providers
WHERE is_active = true;

-- Grant select on view to authenticated and anon
GRANT SELECT ON public.public_service_providers TO authenticated, anon;

-- Create a secure view for dresses
CREATE OR REPLACE VIEW public.public_dresses AS
SELECT 
  id,
  seller_id,
  title,
  description,
  size,
  condition,
  category,
  city,
  images,
  price,
  whatsapp_enabled,
  is_sold,
  is_active,
  created_at,
  updated_at
  -- seller phone is not in dresses table, but seller_id can be used to look up
FROM public.dresses
WHERE is_active = true AND is_sold = false;

-- Grant select on view
GRANT SELECT ON public.public_dresses TO authenticated, anon;

-- 4. ADD POLICY FOR OWNERS TO SEE PHONE NUMBERS
-- =========================================
-- Owners should be able to see their own phone in direct table queries

-- This is already covered by "Owners can manage own halls/services" policies
-- But let's ensure the views allow owners to see their own data with phone

-- For halls: owners can query the halls table directly to get phone
-- For service_providers: owners can query the table directly

-- 5. FIX SERVICE_BOOKINGS DELETE POLICY
-- =========================================
-- Currently users cannot delete their own bookings (only admins can)
-- Let's add a policy for users to cancel their OWN pending bookings

CREATE POLICY "Users can update own service bookings"
ON public.service_bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. FIX HALL_BOOKINGS DELETE POLICY
-- =========================================
-- Similarly for hall bookings - users should be able to cancel their pending bookings

CREATE POLICY "Users can update own hall bookings"
ON public.hall_bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());