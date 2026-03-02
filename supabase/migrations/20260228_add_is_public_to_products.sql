-- Add is_public column to products table for the public application directory
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Allow public read access to public products
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_public = true);
