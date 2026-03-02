-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for avatars
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Avatar Upload Policy" ON storage.objects;
CREATE POLICY "Avatar Upload Policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
CREATE POLICY "Avatar Update Policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;
CREATE POLICY "Avatar Delete Policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
