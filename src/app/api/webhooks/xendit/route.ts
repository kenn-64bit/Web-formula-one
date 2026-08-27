import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { isTierId } from "@/lib/plans";
import { issueInviteLink } from "@/lib/telegram";
import { sendInviteEmail } from "@/lib/email";

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

  if (evt.status !== "PAID" && evt.status !== "SETTLED") {
    return NextResponse.json({ ignored: evt.status });
  }

  const admin = createSupabaseAdminClient();

  // Idempotency: unique on invoice_id. Conflict => already processed (also stops
  // a duplicate invite email).
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

  // The pending row must exist — no blind trust of external_id.
  const { data: row } = await admin
    .from("subscriptions")
    .select("id, email, tier, status")
    .eq("xendit_external_id", evt.external_id)
    .maybeSingle();

  const tier = row?.tier ?? "";
  if (!row || !isTierId(tier)) {
    return NextResponse.json({ error: "Unknown purchase" }, { status: 404 });
  }

  // Telegram invite — failure must not fail the webhook.
  let inviteLink: string | null = null;
  try {
    inviteLink = await issueInviteLink(evt.external_id);
  } catch (e) {
    console.error("[xendit] telegram invite failed", e);
  }

  const { error: updateError } = await admin
    .from("subscriptions")
    .update({
      status: "active",
      paid_at: evt.paid_at ?? new Date().toISOString(),
      amount: evt.amount ?? undefined,
      ...(inviteLink ? { invite_link: inviteLink } : {}),
    })
    .eq("id", row.id);
  if (updateError) {
    console.error("[xendit] subscription update failed", updateError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (inviteLink) {
    try {
      await sendInviteEmail(row.email, { tier, inviteLink });
    } catch (e) {
      console.error("[xendit] invite email failed", e);
    }
  }

  return NextResponse.json({ ok: true });
}
