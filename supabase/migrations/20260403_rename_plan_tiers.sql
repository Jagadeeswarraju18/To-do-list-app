ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

UPDATE public.profiles
SET subscription_tier = CASE subscription_tier
  WHEN 'Seed' THEN 'free'
  WHEN 'Growth' THEN 'starter'
  WHEN 'Empire' THEN 'pro'
  WHEN 'Startup' THEN 'starter'
  WHEN 'Scale' THEN 'pro'
  WHEN 'Unlimited' THEN 'scale'
  ELSE subscription_tier
END
WHERE subscription_tier IN ('Seed', 'Growth', 'Empire', 'Startup', 'Scale', 'Unlimited');

ALTER TABLE public.profiles
ALTER COLUMN subscription_tier SET DEFAULT 'free';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier IN ('free', 'starter', 'pro', 'scale'));

COMMENT ON COLUMN public.profiles.subscription_tier IS
'The current plan tier of the user. Current values: free, starter, pro, scale.';

UPDATE public.subscriptions
SET plan_type = CASE plan_type
  WHEN 'seed' THEN 'free'
  WHEN 'free' THEN 'free'
  WHEN 'startup' THEN 'starter'
  WHEN 'growth' THEN 'starter'
  WHEN 'scale' THEN 'pro'
  WHEN 'empire' THEN 'pro'
  WHEN 'unlimited' THEN 'scale'
  WHEN 'ultra' THEN 'scale'
  ELSE plan_type
END
WHERE plan_type IN ('seed', 'free', 'startup', 'growth', 'scale', 'empire', 'unlimited', 'ultra');

UPDATE public.payment_transactions
SET plan_type = CASE plan_type
  WHEN 'seed' THEN 'free'
  WHEN 'free' THEN 'free'
  WHEN 'startup' THEN 'starter'
  WHEN 'growth' THEN 'starter'
  WHEN 'scale' THEN 'pro'
  WHEN 'empire' THEN 'pro'
  WHEN 'unlimited' THEN 'scale'
  WHEN 'ultra' THEN 'scale'
  ELSE plan_type
END
WHERE plan_type IN ('seed', 'free', 'startup', 'growth', 'scale', 'empire', 'unlimited', 'ultra');
