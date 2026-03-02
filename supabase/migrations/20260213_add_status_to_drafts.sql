-- Add status column if it doesn't exist
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'content_drafts' and column_name = 'status') then
    alter table content_drafts add column status text default 'draft';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'content_drafts' and column_name = 'posted_at') then
    alter table content_drafts add column posted_at timestamptz;
  end if;
end $$;
