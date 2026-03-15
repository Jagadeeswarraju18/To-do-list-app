-- Add total_scanned column to discovery_runs to visualize the filtering funnel
ALTER TABLE public.discovery_runs
    ADD COLUMN IF NOT EXISTS total_scanned INTEGER DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN public.discovery_runs.total_scanned IS 'Total number of raw signals identified before AI verification filtering.';
