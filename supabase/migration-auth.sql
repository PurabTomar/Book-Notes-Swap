-- =============================================================
-- Book & Notes Swap — Migration: auth, profiles, chat, reports
-- Run AFTER base schema.sql
-- =============================================================

-- ---------- Listings: tie posts to user accounts ----------
alter table public.listings
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists photo_urls text[] not null default '{}';

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  email          text,
  is_sat_verified boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.raw_user_meta_data->>'name', new.email), '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Convenience helper to flip the SATI badge once a .edu-style domain is confirmed
alter table public.profiles enable row level security;
drop policy if exists "profiles_select_own_or_public" on public.profiles;
create policy "profiles_select_own_or_public" on public.profiles
  for select using (true);

-- ---------- Conversations ----------
create table if not exists public.conversations (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references public.listings(id) on delete cascade,
  user_a        uuid references auth.users(id) on delete cascade,
  user_b        uuid references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_user_a_idx on public.conversations (user_a);
create index if not exists conversations_user_b_idx on public.conversations (user_b);

-- ---------- Messages ----------
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id       uuid references auth.users(id) on delete set null,
  content         text not null check (char_length(content) between 1 and 2000),
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------- Reports (spam / inappropriate) ----------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason      text not null,
  details     text,
  status      text not null default 'open',
  created_at  timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;

-- Conversations: only the two participants may read; both may create
drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant" on public.conversations
  for select using (user_a = auth.uid() or user_b = auth.uid());

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant" on public.conversations
  for insert with check (user_a = auth.uid() or user_b = auth.uid());

-- Messages: participant-only read; senders may insert into their threads
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Reports: anyone (with or without an account) may file, reporters can read their own
drop policy if exists "reports_insert_any" on public.reports;
create policy "reports_insert_any" on public.reports
  for insert with check (true);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own" on public.reports
  for select using (reporter_id = auth.uid());

-- ---------- Listings RLS notes ----------
-- Listings remain open-read + open-insert for the hackathon, but updates and
-- deletes are now restricted to the owner when an owner_id is set.
drop policy if exists "listings_update_owner" on public.listings;
create policy "listings_update_owner" on public.listings
  for update using (owner_id is null or owner_id = auth.uid());

drop policy if exists "listings_delete_owner" on public.listings;
create policy "listings_delete_owner" on public.listings
  for delete using (owner_id is null or owner_id = auth.uid());

-- ---------- Realtime: conversations + messages for live chat ----------
do $$
begin
  execute format('alter publication supabase_realtime add table public.conversations');
exception when duplicate_object then null;
end $$;

do $$
begin
  execute format('alter publication supabase_realtime add table public.messages');
exception when duplicate_object then null;
end $$;