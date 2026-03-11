-- Create discovery_runs table to group leads found in a single scan
CREATE TABLE IF NOT EXISTS discovery_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('x', 'reddit', 'linkedin')),
    status TEXT NOT NULL CHECK (status IN ('completed', 'failed', 'running')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    leads_found INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own discovery runs"
    ON discovery_runs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own discovery runs"
    ON discovery_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discovery runs"
    ON discovery_runs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discovery runs"
    ON discovery_runs FOR DELETE
    USING (auth.uid() = user_id);

-- Alter opportunities table to support grouping and Inbox Zero
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES discovery_runs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL;

-- Create indexes for faster querying since this table will get large
CREATE INDEX IF NOT EXISTS idx_opportunities_run_id ON opportunities(run_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_is_archived ON opportunities(is_archived);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_user_product ON discovery_runs(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_started_at ON discovery_runs(started_at DESC);
