-- Add missing columns to opportunities table for Reddit discovery support
ALTER TABLE public.opportunities
    ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS match_score INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS intent_category TEXT DEFAULT 'Generic',
    ADD COLUMN IF NOT EXISTS competitor_name TEXT,
    ADD COLUMN IF NOT EXISTS subreddit TEXT;

-- Drop the existing restrictive source CHECK constraint and replace with a permissive one
ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_source_check;
ALTER TABLE public.opportunities 
    ADD CONSTRAINT opportunities_source_check 
    CHECK (source IN ('manual', 'tweet_url', 'reddit_post', 'discovery', 'x_discovery'));
