-- Add 'unavailable' to the availability_status enum
ALTER TYPE availability_status ADD VALUE IF NOT EXISTS 'unavailable';