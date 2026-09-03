-- Checkout collects the buyer's name and mobile number on the dedicated
-- /checkout page. Nullable: the webhook fulfilment path and any pre-existing
-- rows have no contact data.
alter table public.subscriptions
  add column if not exists first_name text,
  add column if not exists last_name  text,
  add column if not exists phone      text;
