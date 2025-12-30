-- Fix function search path
CREATE OR REPLACE FUNCTION public.get_hall_rating(hall_uuid uuid)
RETURNS TABLE(average_rating numeric, reviews_count bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.hall_reviews
  WHERE hall_id = hall_uuid;
$$;