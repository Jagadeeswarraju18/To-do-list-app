-- Create subscription_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE public.subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'paused');
    END IF;
END
$$;

-- Create subscriptions table if not exists (Updated with MRR tracking)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dodo_subscription_id TEXT UNIQUE,
  dodo_customer_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly', 'one-time'
  status public.subscription_status DEFAULT 'active',
  mrr_cents INT4 DEFAULT 0, -- monthly equivalent price in USD cents
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ... (triggers and policies remain the same) ...

-- Create payment_transactions table for detailed accounting (Updated for MRR/ARR)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dodo_payment_id TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_price_cents INT4 NOT NULL,
  currency TEXT NOT NULL,
  tax_price_cents INT4,
  usd_price_cents INT4, -- amount paid in USD cents
  mrr_cents INT4 NOT NULL, -- monthly equivalent for MRR calculation
  tax_country TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END
$$;
