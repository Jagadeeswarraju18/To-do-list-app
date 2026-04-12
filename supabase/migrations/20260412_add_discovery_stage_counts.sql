ALTER TABLE public.discovery_runs
    ADD COLUMN IF NOT EXISTS relevant_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS high_intent_count INTEGER DEFAULT 0;

COMMENT ON COLUMN public.discovery_runs.relevant_count IS 'Number of candidates that survived semantic and relevance ranking before final insertion.';
COMMENT ON COLUMN public.discovery_runs.high_intent_count IS 'Number of candidates classified as high intent during verification.';
