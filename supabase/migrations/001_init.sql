-- Run in Supabase SQL editor or via CLI
-- Enable UUID extension if needed (usually on by default)

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  is_active boolean default false,
  backtests_used int default 0,
  created_at timestamptz default now()
);

create index if not exists users_stripe_customer_id_idx on public.users (stripe_customer_id);
create index if not exists users_phone_idx on public.users (phone);

create table if not exists public.backtests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  strategy text,
  asset text,
  timeframe text,
  results jsonb,
  ai_analysis text,
  created_at timestamptz default now()
);

create index if not exists backtests_user_id_idx on public.backtests (user_id);

alter table public.users enable row level security;
alter table public.backtests enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Inserts from signup completion use the service role (bypasses RLS).
-- Authenticated clients may insert their own row if needed:
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can read own backtests"
  on public.backtests for select
  using (auth.uid() = user_id);

create policy "Users can insert own backtests"
  on public.backtests for insert
  with check (auth.uid() = user_id);
