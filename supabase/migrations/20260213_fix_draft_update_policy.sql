-- Ensure update policy exists and is correct
drop policy if exists "Users can update their own drafts" on content_drafts;

create policy "Users can update their own drafts"
  on public.content_drafts for update
  using (auth.uid() = user_id);

-- Explicitly grant update permission to authenticated users
grant update on table public.content_drafts to authenticated;
