-- Add new pricing columns to halls table
ALTER TABLE public.halls 
ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'total' CHECK (pricing_type IN ('total', 'per_chair')),
ADD COLUMN IF NOT EXISTS min_capacity_men integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_capacity_women integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_per_chair_weekday integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS price_per_chair_weekend integer DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.halls.pricing_type IS 'Pricing type: total = fixed price, per_chair = price per chair';
COMMENT ON COLUMN public.halls.min_capacity_men IS 'Minimum chairs for men section';
COMMENT ON COLUMN public.halls.min_capacity_women IS 'Minimum chairs for women section';
COMMENT ON COLUMN public.halls.price_per_chair_weekday IS 'Price per chair on weekdays (when pricing_type = per_chair)';
COMMENT ON COLUMN public.halls.price_per_chair_weekend IS 'Price per chair on weekends (when pricing_type = per_chair)';