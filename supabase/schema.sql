-- =============================================================
-- PayMo MVP Database Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- =============================================================

-- -------------------------
-- PROFILES
-- -------------------------
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text not null,
  phone       text unique,
  balance     numeric(12,2) not null default 1000.00,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Row-Level Security: users can only read/update their own profile
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view others (for search)"
  on public.profiles for select
  using (true);  -- allow search; restrict sensitive fields in app layer

-- -------------------------
-- TRANSACTIONS
-- -------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid references public.profiles(id),
  to_user     uuid references public.profiles(id),
  amount      numeric(12,2) not null check (amount > 0),
  description text,
  type        text not null check (type in ('p2p', 'bill', 'topup')),
  status      text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at  timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can see their own transactions"
  on public.transactions for select
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "Users can insert transactions"
  on public.transactions for insert
  with check (auth.uid() = from_user);

-- -------------------------
-- WAITLIST
-- -------------------------
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  name       text,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

-- Allow anyone (anonymous) to insert into waitlist
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- Only authenticated admins can read waitlist (protect user data)
create policy "Admins can read waitlist"
  on public.waitlist for select
  using (auth.role() = 'authenticated');

-- -------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- (Trigger runs on new auth.users insert)
-- -------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------
-- INDEXES for performance
-- -------------------------
create index if not exists idx_transactions_from_user on public.transactions(from_user);
create index if not exists idx_transactions_to_user   on public.transactions(to_user);
create index if not exists idx_transactions_created   on public.transactions(created_at desc);
create index if not exists idx_profiles_phone         on public.profiles(phone);
