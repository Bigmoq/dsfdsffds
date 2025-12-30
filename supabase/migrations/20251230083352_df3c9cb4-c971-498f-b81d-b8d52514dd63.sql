-- Add phone and whatsapp_enabled columns to halls table
ALTER TABLE public.halls 
ADD COLUMN phone text,
ADD COLUMN whatsapp_enabled boolean DEFAULT true;