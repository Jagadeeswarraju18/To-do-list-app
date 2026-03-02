create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  platform text not null check (platform in ('x', 'linkedin', 'reddit')),
  content_type text default 'post',
  title text,
  body text,
  topic text,
  style text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.content_drafts enable row level security;

-- Policies
create policy "Users can view their own drafts"
  on public.content_drafts for select
  using (auth.uid() = user_id);

create policy "Users can create their own drafts"
  on public.content_drafts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own drafts"
  on public.content_drafts for delete
  using (auth.uid() = user_id);
