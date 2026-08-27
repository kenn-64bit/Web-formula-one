-- APEX Signals — one-time, email-based VIP purchase schema.
-- Run in the Supabase SQL editor (or `supabase db push`).
-- No Supabase Auth: every read/write goes through the service-role key in the
-- Next.js route handlers.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- subscriptions: one row per purchase (lifetime access, no expiry)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  tier                text check (tier in ('rookie', 'podium', 'constructor')),
  status              text not null default 'pending'
                        check (status in ('pending', 'active')),
  invite_link         text,
  xendit_invoice_id   text,
  xendit_external_id  text not null unique,
  amount              numeric,
  paid_at             timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists subscriptions_email_idx
  on public.subscriptions (lower(email));

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
-- Row Level Security: locked down. No client ever queries these directly;
-- the API routes use the service-role key which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
