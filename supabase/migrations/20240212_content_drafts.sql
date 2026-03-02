-- Content Drafts table for Platform Strategy
-- Stores generated LinkedIn posts, Reddit posts, and other platform content

CREATE TABLE IF NOT EXISTS public.content_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'reddit', 'x')),
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'hook', 'engagement')),
    
    title TEXT,
    body TEXT NOT NULL,
    topic TEXT,
    style TEXT, -- story, listicle, contrarian, lesson, how-to, discussion, resource
    
    subreddit TEXT, -- For Reddit posts
    compliance_notes TEXT[], -- Reddit rule compliance
    
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own content drafts"
    ON public.content_drafts
    FOR ALL
    USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_content_drafts_user_platform 
    ON public.content_drafts(user_id, platform, created_at DESC);

-- Saved subreddits for Reddit module
CREATE TABLE IF NOT EXISTS public.saved_subreddits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    members TEXT,
    relevance TEXT DEFAULT 'medium',
    reason TEXT,
    rules TEXT[],
    tone TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_subreddits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own saved subreddits"
    ON public.saved_subreddits
    FOR ALL
    USING (auth.uid() = user_id);
