import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Xendit } from "xendit-node";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, siteUrl } from "@/lib/env";
import { PLANS, isTierId } from "@/lib/plans";
import { isValidEmail } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tier, email: rawEmail } = (body ?? {}) as {
    tier?: string;
    email?: string;
  };
  if (!tier || !isTierId(tier)) {
    return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
  }
  if (!isValidEmail(rawEmail)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();
  const plan = PLANS[tier];
  const externalId = randomUUID();

  let invoiceUrl: string;
  let invoiceId: string;
  try {
    const xendit = new Xendit({ secretKey: env().XENDIT_SECRET_KEY });
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount: plan.price,
        currency: "PHP",
        payerEmail: email,
        description: `APEX Signals — ${plan.name} (one-time, lifetime access)`,
        successRedirectUrl: `${siteUrl}/success?ref=${externalId}`,
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

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("subscriptions").insert({
    email,
    tier,
    status: "pending",
    xendit_invoice_id: invoiceId,
    xendit_external_id: externalId,
    amount: plan.price,
  });
  if (error) {
    console.error("[checkout] pending row insert failed", error);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }

  return NextResponse.json({ invoiceUrl });
}
