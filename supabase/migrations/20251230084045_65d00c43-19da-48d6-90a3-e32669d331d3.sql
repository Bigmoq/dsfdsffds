-- Create hall_reviews table
CREATE TABLE public.hall_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hall_id uuid NOT NULL REFERENCES public.halls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  booking_id uuid REFERENCES public.hall_bookings(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, hall_id)
);

-- Enable RLS
ALTER TABLE public.hall_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are publicly viewable
CREATE POLICY "Reviews are viewable by everyone"
ON public.hall_reviews
FOR SELECT
USING (true);

-- Users can create reviews for halls they've booked
CREATE POLICY "Users can create reviews for booked halls"
ON public.hall_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.hall_bookings
    WHERE hall_bookings.hall_id = hall_reviews.hall_id
    AND hall_bookings.user_id = auth.uid()
    AND hall_bookings.status = 'accepted'
  )
);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.hall_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.hall_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_hall_reviews_updated_at
BEFORE UPDATE ON public.hall_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to calculate hall average rating
CREATE OR REPLACE FUNCTION public.get_hall_rating(hall_uuid uuid)
RETURNS TABLE(average_rating numeric, reviews_count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
    COUNT(*)::bigint as reviews_count
  FROM public.hall_reviews
  WHERE hall_id = hall_uuid;
$$;