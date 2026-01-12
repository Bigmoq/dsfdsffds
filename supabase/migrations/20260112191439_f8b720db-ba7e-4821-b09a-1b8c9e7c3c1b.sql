-- Add vendor_welcome_seen column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vendor_welcome_seen boolean DEFAULT false;