
-- Create service bookings table
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.service_packages(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  booking_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_price INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view own service bookings"
ON public.service_bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Providers can view bookings for their services
CREATE POLICY "Providers can view their service bookings"
ON public.service_bookings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.service_providers
  WHERE id = service_bookings.provider_id
  AND owner_id = auth.uid()
));

-- Users can create bookings
CREATE POLICY "Users can create service bookings"
ON public.service_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Providers can update booking status
CREATE POLICY "Providers can update service bookings"
ON public.service_bookings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.service_providers
  WHERE id = service_bookings.provider_id
  AND owner_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_service_bookings_provider ON public.service_bookings(provider_id);
CREATE INDEX idx_service_bookings_user ON public.service_bookings(user_id);
CREATE INDEX idx_service_bookings_date ON public.service_bookings(booking_date);

-- Update availability when booking is confirmed
CREATE OR REPLACE FUNCTION public.update_provider_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    INSERT INTO public.service_provider_availability (provider_id, date, status)
    VALUES (NEW.provider_id, NEW.booking_date, 'booked')
    ON CONFLICT (provider_id, date) 
    DO UPDATE SET status = 'booked';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add unique constraint for availability
ALTER TABLE public.service_provider_availability 
ADD CONSTRAINT unique_provider_date UNIQUE (provider_id, date);

CREATE TRIGGER update_availability_on_booking
AFTER INSERT OR UPDATE ON public.service_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_provider_availability_on_booking();
