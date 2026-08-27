import { NextResponse } from "next/server";
import { Xendit } from "xendit-node";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, siteUrl } from "@/lib/env";
import { PLANS, isTierId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tier = (body as { tier?: string }).tier;
  if (!tier || !isTierId(tier)) {
    return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
  }
  const plan = PLANS[tier];

  const externalId = `${user.id}:${tier}:${Date.now()}`;

  let invoiceUrl: string;
  let invoiceId: string;
  try {
    const xendit = new Xendit({ secretKey: env().XENDIT_SECRET_KEY });
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount: plan.priceIDR,
        currency: "IDR",
        payerEmail: user.email ?? undefined,
        description: `APEX Signals — ${plan.name} (30 days)`,
        successRedirectUrl: `${siteUrl}/?paid=1`,
        failureRedirectUrl: `${siteUrl}/?failed=1`,
        invoiceDuration: 3600,
      },
    });
    if (!invoice.invoiceUrl || !invoice.id) {
      throw new Error("Xendit returned an incomplete invoice");
    }
    invoiceUrl = invoice.invoiceUrl;
    invoiceId = invoice.id;
  } catch (e) {
    console.error("[checkout] Xendit invoice failed", e);
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 502 },
    );
  }

  // Record the pending intent (RLS-bypassing admin write).
  const admin = createSupabaseAdminClient();
  await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      tier,
      xendit_invoice_id: invoiceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ invoiceUrl });
}
