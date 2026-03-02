-- Add is_upgraded column to creator_profiles
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS is_upgraded BOOLEAN DEFAULT FALSE;

-- Update the existing fetch logic (it's mostly client-side but we could add a view or function if needed)
-- For now, just adding the column is enough as the client query will include it.
