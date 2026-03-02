-- Add active_product_id to profiles for context-aware discovery
ALTER TABLE public.profiles 
ADD COLUMN active_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
ADD COLUMN subscription_tier TEXT DEFAULT 'Seed' CHECK (subscription_tier IN ('Seed', 'Growth', 'Empire'));

-- Create an index to improve lookup speed for active product
CREATE INDEX idx_profiles_active_product ON public.profiles(active_product_id);

-- Optional: Add a comment to explain the fields
COMMENT ON COLUMN public.profiles.active_product_id IS 'The current product context selected by the founder for discovery and signals.';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'The current plan tier of the user (Seed, Growth, Empire).';
