-- Add relevance score and categorical intent to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS relevance_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS intent_category TEXT;

-- Update source constraint to include 'discovery' if it was missed, 
-- though 'tweet_url' is currently used.
ALTER TABLE public.opportunities 
DROP CONSTRAINT IF EXISTS opportunities_source_check;

ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_source_check 
CHECK (source IN ('manual', 'tweet_url', 'discovery'));
