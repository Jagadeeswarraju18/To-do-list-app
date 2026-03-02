-- Create content_generation_logs table for the Founder Positioning Engine flywheel
create table if not exists content_generation_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  signal_id text, -- Optional, links to original signal if present
  platform text not null, -- 'twitter', 'linkedin', 'reddit'
  
  -- Strategy Inputs
  pain_type text,
  urgency_level text,
  competitor_detected boolean default false,
  theme_source text, -- 'signal', 'weekly_trend', 'competitor_gap', 'founder_story', 'product_insight', 'manual_theme'
  
  -- Computed Strategy
  content_mode text, -- 'authority', 'pain_amplifier', 'product_story', 'contrarian', 'lesson', 'case_study'
  content_goal text, -- 'build_authority', 'attract_inbound', 'share_lesson', 'introduce_product', 'challenge_norm'
  positioning_angle text, -- 'story', 'mistake', 'lesson', 'breakdown', 'opinion', 'myth_buster', 'insight', 'comparison'
  platform_format text, -- 'short_post', 'thread', 'long_form', 'comment_style'
  product_mention_level text, -- 'none', 'subtle', 'contextual', 'direct_story'
  ending_style text, -- 'reflective_close', 'open_question', 'soft_invite', 'neutral_end'
  hook_type text,
  preferred_length text, -- 'short', 'balanced', 'deep'
  
  -- Scores & Metrics
  predicted_engagement_score numeric, -- AI guess (internal ranking)
  promotion_risk_score numeric, -- AI guess (internal ranking)
  heuristic_score numeric, -- Deterministic: Theme Priority Score
  freshness_score integer, -- Deterministic: Hours since signal
  is_signal_based boolean default true,
  
  -- Content & Action
  generated_content text,
  user_action varchar(20), -- 'generated', 'copied', 'edited', 'posted', 'ignored', 'converted'
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table content_generation_logs enable row level security;

-- Policy: Users can insert their own logs
drop policy if exists "Users can insert their own logs" on content_generation_logs;
create policy "Users can insert their own logs"
  on content_generation_logs for insert
  with check (auth.uid() = user_id);

-- Policy: Users can view their own logs
drop policy if exists "Users can view their own logs" on content_generation_logs;
create policy "Users can view their own logs"
  on content_generation_logs for select
  using (auth.uid() = user_id);

-- Policy: Users can update their own logs (e.g., to update user_action)
drop policy if exists "Users can update their own logs" on content_generation_logs;
create policy "Users can update their own logs"
  on content_generation_logs for update
  using (auth.uid() = user_id);
