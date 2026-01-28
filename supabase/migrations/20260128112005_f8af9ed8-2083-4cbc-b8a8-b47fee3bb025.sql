-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Users can create reviews" ON public.service_provider_reviews;

-- Create a new INSERT policy that requires a confirmed/completed booking
CREATE POLICY "Users can create reviews for booked services" 
ON public.service_provider_reviews 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) 
  AND (
    EXISTS (
      SELECT 1 FROM public.service_bookings
      WHERE service_bookings.provider_id = service_provider_reviews.provider_id
      AND service_bookings.user_id = auth.uid()
      AND service_bookings.status IN ('confirmed', 'completed')
    )
  )
);