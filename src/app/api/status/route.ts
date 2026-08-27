import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidEmail } from "@/lib/subscription";

export const runtime = "nodejs";

/**
 * POST /api/status { email } — returns the caller's active VIP purchases.
 * Note: this leaks whether an email has an active purchase (light enumeration).
 * Acceptable for v1; move to an emailed magic link if that becomes a concern.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body as { email?: string }).email;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("tier, invite_link, paid_at")
    .eq("email", email.toLowerCase())
    .eq("status", "active")
    .order("paid_at", { ascending: false });

  if (error) {
    console.error("[status] query failed", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  return NextResponse.json({
    purchases: (data ?? []).map((r) => ({
      tier: r.tier,
      inviteLink: r.invite_link,
      paidAt: r.paid_at,
    })),
  });
}
