-- Add social_links column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Security: Ensure users can update their own social links (covered by existing update policy)
-- Existing policy: CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
