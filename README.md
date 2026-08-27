# APEX Signals — F1-Broadcast landing + one-time VIP purchase

Next.js (App Router) landing page art-directed as a Formula 1 broadcast package.
The product is a **one-time payment** that grants **lifetime** access to a VIP
Telegram channel. No accounts, no subscription, no expiry.

```
"Join {tier}"  →  enter email  →  /api/checkout (Xendit invoice)  →  hosted checkout
        →  Xendit webhook /api/webhooks/xendit
             →  subscriptions row: pending → active
             →  Telegram single-use invite link created
             →  link emailed (Resend)
        →  /success?ref=<id>  shows the link (polls /api/purchase)
        →  /status            re-fetches the link by email (/api/status)
```

## Stack

- Next.js 16 App Router, TypeScript, Tailwind CSS v4
- Supabase Postgres (datastore only — **no Auth**; all access via the service-role key)
- Xendit (Invoice API + webhook, verified via `x-callback-token`)
- Telegraf (`createChatInviteLink` — single-use invite links)
- Resend (invite-link email; raw `fetch`, no SDK)

## Setup

1. **Install**: `npm install`
2. **Env**: `cp .env.example .env.local` and fill every value.
3. **Database**: run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
   Creates `subscriptions` (one row per purchase, email-keyed) + `payments`
   (webhook audit / idempotency), an `updated_at` trigger, and RLS enabled with
   no policies (routes use the service-role key).
4. **Xendit**: create an "Invoice paid" webhook pointing at
   `https://<host>/api/webhooks/xendit`; copy the verification token into
   `XENDIT_CALLBACK_TOKEN`.
5. **Telegram**: create a bot with @BotFather, add it as an **admin** of the VIP
   channel/group with the "invite users via link" right. Put the bot token and
   the numeric chat id in env.
6. **Resend**: create an API key and a verified sender; set `RESEND_API_KEY` /
   `RESEND_FROM`.
7. **Run**: `npm run dev`

## Frontend without real keys

`.env.local` ships with placeholder values so `npm run dev` runs out of the box
for design work. `/api/*` routes stay non-functional until real credentials are set.

The hero background is a WebGL grid-distortion field (`three`,
`src/components/backgrounds/GridDistortion.tsx`, adapted from reactbits): a
procedural flowing cyan/teal field that ripples on mouse movement. Loaded
client-side only, pauses when scrolled offscreen, with an always-on CSS
`.hero-field` layer (`src/app/globals.css`) as the no-WebGL fallback.

## Key files

| Area | Path |
| --- | --- |
| Design tokens / motifs | `src/app/globals.css` |
| UI primitives | `src/components/ui/*` |
| Landing page | `src/app/(site)/page.tsx` + `src/components/PricingSection.tsx` |
| Tiers / feature matrix | `src/lib/plans.ts` |
| Checkout (email + tier) | `src/app/api/checkout/route.ts` |
| Xendit webhook | `src/app/api/webhooks/xendit/route.ts` |
| Post-payment lookup | `src/app/api/purchase/route.ts` + `src/app/(site)/success/page.tsx` |
| Re-fetch link by email | `src/app/api/status/route.ts` + `src/app/(site)/status/page.tsx` |
| Telegram invite | `src/lib/telegram.ts` |
| Invite email (Resend) | `src/lib/email.ts` |

## Testing the flow

1. `npm run dev`, open `/`, click **Join Podium** → an email field appears →
   submit. With a real Xendit test key you're redirected to a live invoice; with
   the placeholder key you get a graceful `502`.
2. Simulate the paid webhook (use the `xendit_external_id` from the pending
   `subscriptions` row created at checkout):
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/xendit \
     -H "x-callback-token: $XENDIT_CALLBACK_TOKEN" \
     -H "content-type: application/json" \
     -d '{"id":"inv_test_1","external_id":"<uuid>","status":"PAID","amount":2500}'
   ```
   → row flips `pending` → `active`, `invite_link` set, `payments` row written,
   `sendInviteEmail` fires. Re-send the same body → `{ deduped: true }`, no
   second email.
3. Unknown `external_id` → `404` (the pending row must exist).
4. `/success?ref=<uuid>` → polls `/api/purchase`, shows "generating" then the
   link once the webhook has run.
5. `/status` → enter the email → the active purchase + invite link.

## Notes

- **Model**: one-time payment in PHP (₱1,000 / ₱2,500 / ₱3,000 — `src/lib/plans.ts`),
  **lifetime** access. No expiry, no cron, no renewal.
- **No accounts.** Identity is the email entered at checkout. `/api/status` will
  confirm whether an email has an active purchase (light enumeration) — swap to an
  emailed magic link if that matters.
- **Telegram removal is not automated.** Invite links are single-use
  (`member_limit: 1`); there is no `kickChatMember` path. Removing a member is
  manual for now.
- **Invite delivery** is triple: `/success` page, `/status` lookup, and the Resend
  email. If Resend fails the webhook still succeeds — the link is in the DB and on
  both pages.
