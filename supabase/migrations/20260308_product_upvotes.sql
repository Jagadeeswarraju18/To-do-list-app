-- Add category and upvotes_count to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS upvotes_count INTEGER DEFAULT 0;

-- Create product_upvotes junction table
CREATE TABLE IF NOT EXISTS public.product_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.product_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can read upvotes (public directory)
CREATE POLICY "Anyone can view upvotes"
  ON public.product_upvotes FOR SELECT
  USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Users can insert own upvotes"
  ON public.product_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own upvotes
CREATE POLICY "Users can delete own upvotes"
  ON public.product_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- Allow public read access to products for the directory
CREATE POLICY "Public can view public products"
  ON public.products FOR SELECT
  USING (is_public = true);

-- Trigger function to sync upvotes_count
CREATE OR REPLACE FUNCTION public.handle_upvote_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products SET upvotes_count = upvotes_count + 1 WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_upvote_change ON public.product_upvotes;
CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON public.product_upvotes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_upvote_change();

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_product_upvotes_product ON public.product_upvotes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_upvotes_user ON public.product_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_upvotes ON public.products(upvotes_count DESC);
