-- Create availability status enum for service providers
CREATE TYPE public.service_availability_status AS ENUM ('available', 'booked', 'unavailable');

-- Create service provider availability table
CREATE TABLE public.service_provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status service_availability_status NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Enable RLS
ALTER TABLE public.service_provider_availability ENABLE ROW LEVEL SECURITY;

-- Everyone can view availability
CREATE POLICY "Availability is viewable by everyone"
ON public.service_provider_availability
FOR SELECT
USING (true);

-- Owners can manage their service provider availability
CREATE POLICY "Owners can manage availability"
ON public.service_provider_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.service_providers
    WHERE service_providers.id = service_provider_availability.provider_id
    AND service_providers.owner_id = auth.uid()
  )
);

-- Create index for faster queries
CREATE INDEX idx_service_provider_availability_provider_date 
ON public.service_provider_availability(provider_id, date);