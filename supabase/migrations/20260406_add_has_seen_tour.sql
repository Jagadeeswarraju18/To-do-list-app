-- Add `has_seen_tour` column to the `profiles` table to track onboarding status persistantly.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN DEFAULT FALSE;
