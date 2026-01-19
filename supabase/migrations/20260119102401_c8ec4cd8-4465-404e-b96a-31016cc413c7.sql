-- Fix profiles table: Restrict public access to authenticated users only
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create policy for authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix halls table: Create a view without phone for public access
-- First, drop the existing public view policy and create a more restrictive one
DROP POLICY IF EXISTS "Halls are viewable by everyone" ON public.halls;

-- Create a view for public halls that excludes the phone column
CREATE OR REPLACE VIEW public.public_halls 
WITH (security_invoker=on) AS
SELECT 
  id,
  owner_id,
  name_ar,
  name_en,
  description,
  city,
  address,
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
  is_active,
  cover_image,
  gallery_images,
  features,
  whatsapp_enabled,
  created_at,
  updated_at
FROM public.halls
WHERE is_active = true;

-- Grant select on the public view
GRANT SELECT ON public.public_halls TO anon, authenticated;

-- Create new policy for halls table - only authenticated users can see full details including phone
CREATE POLICY "Authenticated users can view active halls"
ON public.halls
FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);