-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  pain_solved TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- search_queries table
CREATE TABLE public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_type TEXT NOT NULL, -- 'alternative', 'frustration', 'how_to', 'comparison', 'custom'
  x_search_url TEXT NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('strong', 'good', 'experimental')),
  confidence_reason TEXT NOT NULL,
  before_example TEXT,
  after_example TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- opportunities table
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  discovered_from_query_id UUID REFERENCES public.search_queries(id),
  source TEXT NOT NULL CHECK (source IN ('manual', 'tweet_url')),
  tweet_url TEXT, -- UNIQUE constraint added below conditionally or just logically handled
  tweet_content TEXT NOT NULL,
  tweet_author TEXT,
  author_bio TEXT,
  tweet_posted_at TIMESTAMPTZ,
  intent_level TEXT NOT NULL CHECK (intent_level IN ('high', 'medium', 'low')),
  intent_reasons TEXT[], 
  pain_detected TEXT,
  suggested_dm TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'replied', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint for tweet_url per user (so different users can find same tweet, OR global? 
-- Decision: Per user makes sense, but also generally unique to avoid duplicates if we scrape globally. 
-- For MVP Manual mode, let's make it unique per user so a user doesn't add same tweet twice.)
CREATE UNIQUE INDEX opportunities_user_tweet_url_idx ON public.opportunities (user_id, tweet_url);

-- daily_usage table
CREATE TABLE public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  signals_discovered INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- RLS POLICIES

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Note: Insert is usually handled by a trigger on auth.users, but for MVP manual logic is okay too. 
-- Let's add an insert policy just in case client creates it.
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Products
CREATE POLICY "Users can CRUD own products" ON public.products FOR ALL USING (auth.uid() = user_id);

-- Search Queries
-- Users can access queries belonging to their products
CREATE POLICY "Users can CRUD own queries" ON public.search_queries FOR ALL 
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

-- Opportunities
CREATE POLICY "Users can CRUD own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id);

-- Daily Usage
CREATE POLICY "Users can view own usage" ON public.daily_usage FOR SELECT USING (auth.uid() = user_id);
-- System (edge functions) usually updates this, but for MVP client-side logic might be used temporarily?
-- Best practice: Only server updates, but user can Read.
-- For MVP simplicity, let's allow Update if user owns it (assuming we enforce logic in API/Server Actions).
CREATE POLICY "Users can update own usage" ON public.daily_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);


-- TRIGGER: Handle New User Signup -> Create Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
