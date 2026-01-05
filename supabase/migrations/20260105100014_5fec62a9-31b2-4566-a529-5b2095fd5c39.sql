-- Add category column to dresses table
ALTER TABLE public.dresses ADD COLUMN category text DEFAULT 'wedding';

-- Add check constraint for valid categories
ALTER TABLE public.dresses ADD CONSTRAINT dresses_category_check 
  CHECK (category IN ('wedding', 'evening', 'maternity'));