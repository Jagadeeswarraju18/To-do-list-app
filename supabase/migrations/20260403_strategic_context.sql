-- Add strategic context columns to the products table
-- Implementation: Strategic Context Expansion
-- Created: 2026-04-03

alter table public.products
add column if not exists competitors text[] default '{}'::text[],
add column if not exists alternatives text[] default '{}'::text[],
add column if not exists strongest_objection text,
add column if not exists proof_results text[] default '{}'::text[],
add column if not exists pricing_position text,
add column if not exists founder_story text,
add column if not exists prioritize_communities text[] default '{}'::text[],
add column if not exists avoid_communities text[] default '{}'::text[];

-- Security: No changes to RLS needed as these are existing record columns.
-- Indices: Consider adding indices later if we perform heavy filtered searches on competitors text[].
