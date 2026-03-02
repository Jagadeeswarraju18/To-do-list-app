-- Create Creator Profiles table
CREATE TABLE public.creator_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  niche TEXT CHECK (niche IN ('SaaS', 'Startups', 'AI', 'Tech', 'Productivity', 'Finance', 'Marketing', 'Developer Tools', 'Other')),
  location TEXT,
  years_experience INT,
  languages TEXT[],
  availability_status BOOLEAN DEFAULT TRUE,
  min_budget DECIMAL(10, 2),
  preferences JSONB DEFAULT '{}'::jsonb, -- product categories, refused categories
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Creator Platforms table
CREATE TABLE public.creator_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('X', 'LinkedIn', 'YouTube', 'Instagram', 'Reddit', 'Newsletter', 'Other')),
  username TEXT NOT NULL,
  url TEXT NOT NULL,
  follower_count INT NOT NULL,
  engagement_rate DECIMAL(5, 2),
  audience_type TEXT,
  pricing JSONB DEFAULT '{}'::jsonb, -- { post: 100, thread: 200, bundle: 500 }
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Collaborations (Deals) table
CREATE TABLE public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'negotiating', 'accepted', 'in_progress', 'submitted', 'completed', 'paid', 'rejected')),
  budget DECIMAL(10, 2),
  deliverables TEXT NOT NULL,
  timeline TIMESTAMPTZ,
  messages JSONB[] DEFAULT ARRAY[]::JSONB[], -- Simple message history for MVP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Creator Profiles
-- Everyone can view creator profiles (Marketplace)
CREATE POLICY "Public can view creator profiles" ON public.creator_profiles FOR SELECT USING (true);
-- Only owner can update
CREATE POLICY "Creators can update own profile" ON public.creator_profiles FOR UPDATE USING (auth.uid() = id);
-- Only owner can insert
CREATE POLICY "Creators can insert own profile" ON public.creator_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Creator Platforms
-- Everyone can view platforms
CREATE POLICY "Public can view creator platforms" ON public.creator_platforms FOR SELECT USING (true);
-- Only owner can manage
CREATE POLICY "Creators can CRUD own platforms" ON public.creator_platforms FOR ALL USING (creator_id = auth.uid());

-- Collaborations
-- Founders can view/create deals they are part of
CREATE POLICY "Founders can view own deals" ON public.collaborations FOR SELECT USING (founder_id = auth.uid());
CREATE POLICY "Founders can create deals" ON public.collaborations FOR INSERT WITH CHECK (founder_id = auth.uid());
CREATE POLICY "Founders can update own deals" ON public.collaborations FOR UPDATE USING (founder_id = auth.uid());

-- Creators can view/update deals they are part of
CREATE POLICY "Creators can view own deals" ON public.collaborations FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Creators can update own deals" ON public.collaborations FOR UPDATE USING (creator_id = auth.uid());
