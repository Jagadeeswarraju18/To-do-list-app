-- Creator Analytics Table
-- Tracks detailed interactions on creator profiles (views, link clicks)

CREATE TABLE IF NOT EXISTS public.creator_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  founder_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Null if anonymous (future proof), but effectively logged in founders
  event_type TEXT NOT NULL CHECK (event_type IN ('profile_view', 'link_click', 'deal_request')),
  metadata JSONB DEFAULT '{}'::jsonb, -- e.g. { url: "https://twitter.com/..." }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_analytics ENABLE ROW LEVEL SECURITY;

-- 1. Creators can view their OWN analytics
CREATE POLICY "Creators can view own analytics" 
  ON public.creator_analytics 
  FOR SELECT 
  USING (creator_id = auth.uid());

-- 2. Anyone (authenticated founders) can INSERT events
-- We want founders to trigger these events when they view a profile
CREATE POLICY "Public can insert analytics" 
  ON public.creator_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Enable Realtime for this table so dashboards update instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_analytics;
