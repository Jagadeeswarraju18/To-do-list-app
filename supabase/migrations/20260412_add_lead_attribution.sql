-- Add lead attribution columns to profiles table
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS lead_source TEXT,
    ADD COLUMN IF NOT EXISTS utm_source TEXT,
    ADD COLUMN IF NOT EXISTS utm_medium TEXT,
    ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
    ADD COLUMN IF NOT EXISTS utm_term TEXT,
    ADD COLUMN IF NOT EXISTS utm_content TEXT;

-- Update the handle_new_user function to capture attribution data from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    lead_source,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
  )
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'lead_source',
    new.raw_user_meta_data->>'utm_source',
    new.raw_user_meta_data->>'utm_medium',
    new.raw_user_meta_data->>'utm_campaign',
    new.raw_user_meta_data->>'utm_term',
    new.raw_user_meta_data->>'utm_content'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
