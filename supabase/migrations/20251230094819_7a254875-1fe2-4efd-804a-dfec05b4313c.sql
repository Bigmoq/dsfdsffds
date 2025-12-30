-- Create service provider reviews table
CREATE TABLE public.service_provider_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, user_id)
);

-- Enable RLS
ALTER TABLE public.service_provider_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.service_provider_reviews
FOR SELECT
USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
ON public.service_provider_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.service_provider_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.service_provider_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_service_provider_reviews_provider 
ON public.service_provider_reviews(provider_id);

-- Create function to get service provider rating
CREATE OR REPLACE FUNCTION public.get_service_provider_rating(provider_uuid uuid)
RETURNS TABLE(average_rating numeric, reviews_count bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_uuid;
$$;

-- Trigger to update provider rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  provider_id_val UUID;
  avg_rating NUMERIC;
  review_count BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    provider_id_val := OLD.provider_id;
  ELSE
    provider_id_val := NEW.provider_id;
  END IF;

  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    COUNT(*)
  INTO avg_rating, review_count
  FROM public.service_provider_reviews
  WHERE provider_id = provider_id_val;

  UPDATE public.service_providers
  SET rating = avg_rating, reviews_count = review_count
  WHERE id = provider_id_val;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger
CREATE TRIGGER update_provider_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.service_provider_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();