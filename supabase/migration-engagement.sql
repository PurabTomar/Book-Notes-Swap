-- Book & Notes Swap - Migration: engagement (view/download counters, ratings, bookmarks)
-- Run once in the Supabase SQL editor. Idempotent - safe to re-run.
-- Requires: migration-auth.sql (for auth) to have been applied first.

-- ---------------------------------------------------------------------------
-- 1) View / download counters on listings
-- ---------------------------------------------------------------------------
alter table public.listings
  add column if not exists view_count integer not null default 0;

alter table public.listings
  add column if not exists download_count integer not null default 0;

-- Security definer RPCs let anon/authenticated increment counters without
-- giving write access to the whole row.
create or replace function public.increment_listing_view(p_listing uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set view_count = view_count + 1 where id = p_listing;
$$;

create or replace function public.increment_listing_download(p_listing uuid)
returns void language sql security definer set search_path = public as $$
  update public.listings set download_count = download_count + 1 where id = p_listing;
$$;

-- Allow calling the RPCs from any client role.
revoke execute on function public.increment_listing_view(uuid) from public;
grant execute on function public.increment_listing_view(uuid) to anon, authenticated;

revoke execute on function public.increment_listing_download(uuid) from public;
grant execute on function public.increment_listing_download(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Ratings (1-5 stars, one per user per listing)
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value integer not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  unique (listing_id, user_id)
);

alter table public.ratings enable row level security;

drop policy if exists "ratings_select_public" on public.ratings;
create policy "ratings_select_public" on public.ratings
  for select using (true);

drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own" on public.ratings
  for insert with check (auth.uid() = user_id);

drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own" on public.ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own" on public.ratings
  for delete using (auth.uid() = user_id);

-- Current average rating per listing (used by the leaderboard / top-rated tab).
create or replace view public.listing_ratings as
select
  listing_id,
  count(*)                as rating_count,
  round(avg(value)::numeric, 2) as rating_avg
from public.ratings
group by listing_id;

-- ---------------------------------------------------------------------------
-- 3) Bookmarks (per-user, wiped when the listing is deleted)
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks
  for select using (auth.uid() = user_id);

drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4) Reports -> minimal admin review queue (extend existing reports table)
--    Adds a review status column if not present.
-- ---------------------------------------------------------------------------
alter table public.reports
  add column if not exists status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed'));

alter table public.reports
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

alter table public.reports
  add column if not exists reviewed_at timestamptz;

create or replace view public.reports_queue as
select r.*, l.title as listing_title
from public.reports r
left join public.listings l on l.id = r.listing_id
order by r.created_at desc;
