ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_source_check;

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_source_check
    CHECK (source IN ('manual', 'tweet_url', 'reddit_post', 'linkedin_post', 'discovery', 'x_discovery'));
