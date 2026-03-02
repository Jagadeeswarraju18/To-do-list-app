-- Diagnostic fix: Disable RLS to rule out permission errors
alter table public.content_drafts disable row level security;

-- Verify columns exist (this will error if they don't, which is good info, but wrapped in DO block to be safe)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'content_drafts' and column_name = 'status') then
    alter table content_drafts add column status text default 'draft';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'content_drafts' and column_name = 'posted_at') then
    alter table content_drafts add column posted_at timestamptz;
  end if;
end $$;

-- Grant everything to authenticated
grant all on table public.content_drafts to authenticated;
grant all on table public.content_drafts to service_role;
