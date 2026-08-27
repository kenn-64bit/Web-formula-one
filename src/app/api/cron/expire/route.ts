import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { kickMember } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily/hourly expiration sweep.
 * Auth: `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this when the
 * env var is set) — portable to any other scheduler.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${env().CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();

  const { data: lapsed, error } = await admin
    .from("subscriptions")
    .select("user_id, telegram_user_id")
    .eq("status", "active")
    .lt("current_period_end", nowIso);

  if (error) {
    console.error("[cron] query failed", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let kicked = 0;
  for (const row of lapsed ?? []) {
    await admin
      .from("subscriptions")
      .update({ status: "expired", invite_link: null, updated_at: nowIso })
      .eq("user_id", row.user_id);

    if (row.telegram_user_id) {
      try {
        await kickMember(row.telegram_user_id);
        kicked++;
      } catch (e) {
        console.error(`[cron] kick failed for ${row.user_id}`, e);
      }
    }
  }

  return NextResponse.json({
    expired: lapsed?.length ?? 0,
    kicked,
    ranAt: nowIso,
  });
}
