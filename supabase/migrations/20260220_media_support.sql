-- Add media support to opportunities table
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'text' CHECK (media_type IN ('text', 'image', 'video', 'mixed'));
