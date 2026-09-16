-- ============================================================
-- Book & Notes Swap - Feature tables (Save + Comments + Views)
-- Run this ONCE in the Supabase SQL editor. Idempotent (safe to re-run).
-- All RLS follows the existing `reports` pattern already in the project.
-- ============================================================

-- 1. SAVE FOR LATER ---------------------------------------------
create table if not exists public.listing_saves (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

alter table public.listing_saves enable row level security;

create policy "Saves are visible to their owner"
  on public.listing_saves for select
  using (auth.uid() = user_id);

create policy "Users create their own saves"
  on public.listing_saves for insert
  with check (auth.uid() = user_id);

create policy "Users remove their own saves"
  on public.listing_saves for delete
  using (auth.uid() = user_id);

-- 2. COMMENTS / DOUBTS THREAD -----------------------------------
create table if not exists public.listing_comments (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.listing_comments enable row level security;

create policy "Comments are visible to signed-in users"
  on public.listing_comments for select
  using (auth.role() = 'authenticated');

create policy "Users post their own comments"
  on public.listing_comments for insert
  with check (auth.uid() = user_id);

create policy "Users delete their own comments"
  on public.listing_comments for delete
  using (auth.uid() = user_id);

create index if not exists listing_comments_listing_created_idx
  on public.listing_comments (listing_id, created_at asc);

-- 3. VIEW LOG (powers Trending) ----------------------------------
create table if not exists public.listing_views (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.listings(id) on delete cascade,
  viewer_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.listing_views enable row level security;

create policy "Views can be recorded by anyone"
  on public.listing_views for insert
  with check (true);

create policy "Views are visible to signed-in users"
  on public.listing_views for select
  using (auth.role() = 'authenticated');

create index if not exists listing_views_created_idx
  on public.listing_views (created_at desc);