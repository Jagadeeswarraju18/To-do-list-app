-- user_integrations table for OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'twitter'
    external_user_id TEXT,
    external_username TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can CRUD own integrations" ON public.user_integrations
    FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON public.user_integrations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
