ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (
  subscription_tier IN (
    'Seed',
    'Growth',
    'Empire',
    'Startup',
    'Scale',
    'Unlimited'
  )
);

COMMENT ON COLUMN public.profiles.subscription_tier IS
'The current plan tier of the user. Legacy values: Seed, Growth, Empire. Current values: Seed, Startup, Scale, Unlimited.';
