-- Extend products table for structured onboarding data

-- Step 1: Product Basics
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Step 2: Problem Definition (pain_solved already exists)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_describes_problem TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_frustrations TEXT;

-- Step 3: Target Audience (target_audience already exists as free text)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ideal_user TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_model TEXT CHECK (business_model IN ('B2B', 'B2C', 'Both'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS target_geography TEXT;

-- Step 4: Keywords & Pain Phrases
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pain_phrases TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 5: Scan Window
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS scan_window TEXT DEFAULT '24h' CHECK (scan_window IN ('24h', '72h', '7d', '30d'));

-- Step 6: Outreach Tone
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS outreach_tone TEXT DEFAULT 'friendly' CHECK (outreach_tone IN ('friendly', 'professional', 'educational', 'casual', 'minimal'));

-- Step 7: Tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
