-- Add status tracking to content_drafts
alter table public.content_drafts 
add column if not exists status text default 'draft' check (status in ('draft', 'posted', 'archived')),
add column if not exists posted_at timestamptz;

-- Index for faster filtering by status
create index if not exists content_drafts_status_idx on public.content_drafts(status);
