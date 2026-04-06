-- Add founder_writing_samples to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS writing_samples TEXT[] DEFAULT '{}';
