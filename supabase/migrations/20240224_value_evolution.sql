-- Value Evolution: ROI Tracking and Marketplace
-- Add revenue tracking to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS conversion_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS match_score INTEGER DEFAULT 0;

-- Create collaborations (Lead Bounties) table
CREATE TABLE IF NOT EXISTS public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  bounty_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for collaborations
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can CRUD own collaborations" ON public.collaborations
FOR ALL USING (auth.uid() = founder_id);

CREATE POLICY "Creators can view and update own collaborations" ON public.collaborations
FOR ALL USING (auth.uid() = creator_id);
