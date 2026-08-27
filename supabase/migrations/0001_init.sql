-- APEX Signals — subscription pipeline schema
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- subscriptions: one row per user
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users (id) on delete cascade,
  tier                text check (tier in ('rookie', 'podium', 'constructor')),
  status              text not null default 'inactive'
                        check (status in ('inactive', 'active', 'expired')),
  current_period_end  timestamptz,
  telegram_user_id    bigint,
  invite_link         text,
  usage_count         integer not null default 0,
  usage_limit         integer not null default 100,
  xendit_invoice_id   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists subscriptions_expiry_idx
  on public.subscriptions (status, current_period_end);

-- ---------------------------------------------------------------------------
-- payments: append-only audit log of Xendit webhook events (idempotency)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    text not null unique,
  external_id   text not null,
  status        text not null,
  amount        numeric,
  paid_at       timestamptz,
  raw           jsonb,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--   * users may read only their own subscription row
--   * all writes happen via the service-role key (bypasses RLS) in API routes
--   * payments is never exposed to clients
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

drop policy if exists "own subscription readable" on public.subscriptions;
create policy "own subscription readable"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Auto-provision an empty subscription row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
