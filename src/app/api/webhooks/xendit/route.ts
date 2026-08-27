import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { PLANS, isTierId } from "@/lib/plans";
import { extendPeriod, parseExternalId } from "@/lib/subscription";
import { issueInviteLink, sendInvite } from "@/lib/telegram";

export const runtime = "nodejs";

const payloadSchema = z.object({
  id: z.string(),
  external_id: z.string(),
  status: z.string(),
  amount: z.number().optional(),
  paid_at: z.string().optional(),
});

function tokenOk(received: string | null): boolean {
  if (!received) return false;
  const expected = env().XENDIT_CALLBACK_TOKEN;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!tokenOk(req.headers.get("x-callback-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  const evt = parsed.data;

  const paid = evt.status === "PAID" || evt.status === "SETTLED";
  if (!paid) {
    return NextResponse.json({ ignored: evt.status });
  }

  const admin = createSupabaseAdminClient();

  // Idempotency: unique on invoice_id. Conflict => already processed.
  const { error: dupeError } = await admin.from("payments").insert({
    invoice_id: evt.id,
    external_id: evt.external_id,
    status: evt.status,
    amount: evt.amount ?? null,
    paid_at: evt.paid_at ?? new Date().toISOString(),
    raw: json,
  });
  if (dupeError) {
    if (dupeError.code === "23505") {
      return NextResponse.json({ ok: true, deduped: true });
    }
    console.error("[xendit] payments insert failed", dupeError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const ref = parseExternalId(evt.external_id);
  if (!ref || !isTierId(ref.tier)) {
    return NextResponse.json({ error: "Unresolvable external_id" }, { status: 422 });
  }
  const plan = PLANS[ref.tier];

  const { data: existing } = await admin
    .from("subscriptions")
    .select("current_period_end, telegram_user_id")
    .eq("user_id", ref.userId)
    .maybeSingle();

  const newEnd = extendPeriod(
    existing?.current_period_end ?? null,
    plan.durationDays,
  );

  // Telegram onboarding — failure here must not fail the webhook.
  let inviteLink: string | null = null;
  try {
    inviteLink = await issueInviteLink(ref.userId);
    if (existing?.telegram_user_id && inviteLink) {
      await sendInvite(existing.telegram_user_id, inviteLink).catch(() => {});
    }
  } catch (e) {
    console.error("[xendit] telegram invite failed", e);
  }

  const { error: updateError } = await admin.from("subscriptions").upsert(
    {
      user_id: ref.userId,
      tier: ref.tier,
      status: "active",
      current_period_end: newEnd.toISOString(),
      xendit_invoice_id: evt.id,
      ...(inviteLink ? { invite_link: inviteLink } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (updateError) {
    console.error("[xendit] subscription upsert failed", updateError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
