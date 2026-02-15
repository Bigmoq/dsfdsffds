
-- Add payment columns to hall_bookings
ALTER TABLE public.hall_bookings 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS amount integer;

-- Add payment columns to service_bookings
ALTER TABLE public.service_bookings 
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS amount integer;
