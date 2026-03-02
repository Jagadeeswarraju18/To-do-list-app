-- Add media_kit column to creator_profiles
ALTER TABLE public.creator_profiles 
ADD COLUMN IF NOT EXISTS media_kit JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for creator assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator_assets', 'creator_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'creator_assets' );

CREATE POLICY "Creators can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creator_assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Creators can update assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'creator_assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Creators can delete assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'creator_assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
