# APEX Signals — F1-Broadcast SaaS + VIP Telegram Pipeline

Next.js (App Router) subscription site art-directed as a Formula 1 broadcast package,
with a full payment → access pipeline:

```
Pricing "Join VIP"  →  /api/checkout (Xendit invoice)  →  hosted checkout
        →  Xendit webhook /api/webhooks/xendit  →  Supabase subscription = active (+30d)
        →  Telegram single-use invite link generated (delivered via bot DM once the
           user is linked — see Notes)
        →  hourly Vercel Cron /api/cron/expire  →  expired users kicked from VIP channel
        →  renewal re-runs the webhook path with a fresh link
```

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Supabase (Postgres + Auth, email magic-link)
- Xendit (Invoice API + webhook, verified via `x-callback-token`)
- Telegraf (bot: `createChatInviteLink`, `banChatMember` + `unbanChatMember`)
- Vercel Cron for the expiration sweep

## Setup

1. **Install**: `npm install`
2. **Env**: `cp .env.example .env.local` and fill every value. See comments in
   `.env.example` for where each key comes from.
3. **Database**: run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
   Creates `subscriptions` + `payments`, RLS (users read only their own row), an
   `updated_at` trigger, and a trigger that provisions an empty `subscriptions`
   row on signup.
4. **Supabase Auth**: enable Email provider. Add `http://localhost:3000/auth/callback`
   (and the prod equivalent) to the allowed redirect URLs.
5. **Xendit**: create an "Invoice paid" webhook pointing at
   `https://<host>/api/webhooks/xendit`; copy the verification token into
   `XENDIT_CALLBACK_TOKEN`.
6. **Telegram**: create a bot with @BotFather, add it as an **admin** of the VIP
   channel/group with "invite users via link" + "ban users" rights. Put the bot
   token and the numeric chat id in env.
7. **Run**: `npm run dev`

## Debugging the frontend (no real keys)

`.env.local` ships with placeholder values so `npm run dev` runs out of the box.
The single landing page (`/`) renders for design work; `/api/*` routes stay
non-functional until real credentials are filled in.

## Key files

| Area | Path |
| --- | --- |
| Design tokens / motifs | `src/app/globals.css` |
| UI primitives | `src/components/ui/*` (`GlassCard`, `CutButton`, `RpmBar`, `HalftoneField`, `Badge`, `CheckeredDivider`) |
| Page (single) | `src/app/(site)/page.tsx` + `src/components/PricingSection.tsx` |
| Plans / feature matrix | `src/lib/plans.ts` |
| Checkout | `src/app/api/checkout/route.ts` |
| Webhook | `src/app/api/webhooks/xendit/route.ts` |
| Expiration cron | `src/app/api/cron/expire/route.ts` + `vercel.json` |
| Telegram wrapper | `src/lib/telegram.ts` |
| Period math / idempotency helpers | `src/lib/subscription.ts` |
| Session refresh | `src/proxy.ts` |

## Testing the pipeline

- **Checkout**: `/api/checkout` still requires an authenticated Supabase user, so
  the plan buttons show "Sign-in required" until the accounts area is rebuilt. Test
  the invoice call directly by POSTing `{ "tier": "podium" }` with a valid session
  cookie.
- **Webhook** (simulate a paid invoice):
  ```bash
  curl -X POST http://localhost:3000/api/webhooks/xendit \
    -H "x-callback-token: $XENDIT_CALLBACK_TOKEN" \
    -H "content-type: application/json" \
    -d '{"id":"inv_test_1","external_id":"<USER_UUID>:podium:1","status":"PAID","amount":349000}'
  ```
  → `subscriptions.status = active`, `current_period_end ≈ now + 30d`,
  `invite_link` populated, a `payments` row written. Re-send the same body →
  `{ deduped: true }`, no double extension.
- **Cron**:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/expire
  ```
  Set a row's `current_period_end` to the past first → it flips to `expired`,
  `invite_link` cleared, and (if `telegram_user_id` is set) the member is kicked.

## Notes

- **Billing model**: fixed 30-day access per paid invoice, manual renewal. Extends
  from `max(now, current_period_end)` so early renewals stack.
- **Single page, no auth UI**: the whole site is one landing page (`/`) — hero,
  features, podium pricing, spec-sheet table. There is no login/account screen yet;
  the Supabase auth infra (`src/proxy.ts`, `src/lib/supabase/*`,
  `src/app/auth/callback`) stays in place for a future accounts area.
- **Invite-link delivery**: the webhook generates the single-use link and stores it
  on the `subscriptions` row. Automatic delivery needs `telegram_user_id`, which
  requires a `/start <token>` deep-link linking flow (not built). Until then, read
  `invite_link` from the row and send it manually; the cron kick is also skipped for
  unlinked users.
- The `subscriptions.usage_count` / `usage_limit` columns are unused by the current
  UI but kept for a future counter.
