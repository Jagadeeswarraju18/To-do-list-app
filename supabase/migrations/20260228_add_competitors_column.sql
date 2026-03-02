-- Add competitors column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT ARRAY[]::TEXT[];
