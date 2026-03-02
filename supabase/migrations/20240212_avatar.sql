-- Add avatar_url column to creator_profiles
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
