import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/purchase?ref=<xendit_external_id> — used by /success to poll. */
export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("tier, status, invite_link")
    .eq("xendit_external_id", ref)
    .maybeSingle();

  if (error) {
    console.error("[purchase] query failed", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    tier: data.tier,
    status: data.status,
    inviteLink: data.status === "active" ? data.invite_link : null,
  });
}
