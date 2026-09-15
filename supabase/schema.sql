-- =============================================================
-- Book & Notes Swap — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- 1) Listings table
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 200),
  subject     text not null,
  semester    smallint not null check (semester between 1 and 12),
  condition   text not null check (condition in ('New', 'Good', 'Fair')),
  price       numeric check (price >= 0),
  is_free     boolean not null default false,
  description text,
  photo_url   text,
  contact_email    text,
  contact_phone    text,
  contact_whatsapp text,
  resource_type  text,
  branch         text,
  status     text not null default 'available' check (status in ('available', 'sold')),
  created_at timestamptz not null default now()
);

-- Useful indexes for search + filters
create index if not exists listings_subject_idx       on public.listings (subject);
create index if not exists listings_semester_idx      on public.listings (semester);
create index if not exists listings_created_at_idx    on public.listings (created_at desc);
create index if not exists listings_status_idx        on public.listings (status);
create index if not exists listings_resource_type_idx on public.listings (resource_type);
create index if not exists listings_branch_idx        on public.listings (branch);

-- 2) Storage bucket for listing photos
-- Nobody may see a photo unless the bucket "listing-images" exists and is public.
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create or replace function public.gen_photo_path(ext text)
returns text
language sql
as $$
  select 'listings/' || gen_random_uuid()::text || '.' || lower(ext)
$$;

-- 3) Row Level Security (RLS)
-- Hackathon mode: anyone can read, post, update, and delete listings.
-- Once you add authentication, restrict these policies to auth.uid().

alter table public.listings enable row level security;

drop policy if exists "listings_public_read"  on public.listings;
create policy "listings_public_read" on public.listings
  for select using (true);

drop policy if exists "listings_public_insert" on public.listings;
create policy "listings_public_insert" on public.listings
  for insert with check (true);

drop policy if exists "listings_public_update" on public.listings;
create policy "listings_public_update" on public.listings
  for update using (true);

drop policy if exists "listings_public_delete" on public.listings;
create policy "listings_public_delete" on public.listings
  for delete using (true);

-- Storage RLS (allow anonymous uploads for the hackathon)
drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "photos_public_insert" on storage.objects;
create policy "photos_public_insert" on storage.objects
  for insert with check (bucket_id = 'listing-images');

-- 4) Real-time: allow the app to subscribe to listing changes
do $$
begin
  execute format('alter publication supabase_realtime add table public.listings');
exception
  when duplicate_object then null;
end $$;