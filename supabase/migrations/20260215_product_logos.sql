-- Add logo_url column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create storage bucket for product logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_logos', 'product_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for product_logos
DROP POLICY IF EXISTS "Public Product Logo Access" ON storage.objects;
CREATE POLICY "Public Product Logo Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product_logos' );

DROP POLICY IF EXISTS "Product Logo Upload Policy" ON storage.objects;
CREATE POLICY "Product Logo Upload Policy"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product_logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Product Logo Update Policy" ON storage.objects;
CREATE POLICY "Product Logo Update Policy"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product_logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Product Logo Delete Policy" ON storage.objects;
CREATE POLICY "Product Logo Delete Policy"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product_logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
