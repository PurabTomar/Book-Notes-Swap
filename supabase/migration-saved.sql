-- ============================================================
-- Migration: "Save for later" bookmarks
-- Match: migration-auth.sql (no policy name conflicts)
-- ============================================================
-- Creates the `listing_saves` join table so signed-in students can
-- bookmark resources on Book & Notes Swap and pull them up later.
-- Idempotent: safe to re-run. Now applies. Run this (or the equivalent
-- "Run migration" block) in the Supabase SQL editor once.
--
--   Save state is per-user. Inserts require you be the bookmarking
--   user; deletes require you be the owner; selects only expose your
--   own bookmarks (RLS, no public read).
-- ============================================================

create table if not exists public.listing_saves (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

alter table public.listing_saves enable row level security;

create policy "Users read own saves"
  on public.listing_saves
  for select
  using (auth.uid() = user_id);

create policy "Users insert own saves"
  on public.listing_saves
  for insert
  with check (auth.uid() = user_id);

create policy "Users delete own saves"
  on public.listing_saves
  for delete
  using (auth.uid() = user_id);
