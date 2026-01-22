-- =========================================
-- FIX SECURITY DEFINER VIEWS
-- =========================================
-- Views should use SECURITY INVOKER (default) to respect the caller's RLS

-- Recreate public_halls with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.public_halls;
CREATE VIEW public.public_halls 
WITH (security_invoker = true) AS
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
FROM public.halls
WHERE is_active = true;

GRANT SELECT ON public.public_halls TO authenticated, anon;

-- Recreate public_service_providers with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.public_service_providers;
CREATE VIEW public.public_service_providers 
WITH (security_invoker = true) AS
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
FROM public.service_providers
WHERE is_active = true;

GRANT SELECT ON public.public_service_providers TO authenticated, anon;

-- Recreate public_dresses with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.public_dresses;
CREATE VIEW public.public_dresses 
WITH (security_invoker = true) AS
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
FROM public.dresses
WHERE is_active = true AND is_sold = false;

GRANT SELECT ON public.public_dresses TO authenticated, anon;