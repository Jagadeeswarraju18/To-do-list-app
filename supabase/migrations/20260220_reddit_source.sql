-- Add Reddit as a discovery source
ALTER TABLE public.opportunities 
DROP CONSTRAINT IF EXISTS opportunities_source_check;

ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_source_check 
CHECK (source IN ('manual', 'tweet_url', 'discovery', 'reddit_post'));

-- Add subreddit column for Reddit signals
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS subreddit TEXT;
