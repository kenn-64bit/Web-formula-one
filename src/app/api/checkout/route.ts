import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Xendit } from "xendit-node";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, siteUrl } from "@/lib/env";
import { PLANS, isTierId } from "@/lib/plans";
import { isValidEmail, isValidName, isValidPhone } from "@/lib/subscription";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    tier,
    email: rawEmail,
    firstName: rawFirstName,
    lastName: rawLastName,
    phone: rawPhone,
  } = (body ?? {}) as {
    tier?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  if (!tier || !isTierId(tier)) {
    return NextResponse.json({ error: "Unknown tier" }, { status: 400 });
  }
  if (!isValidEmail(rawEmail)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (!isValidName(rawFirstName) || !isValidName(rawLastName)) {
    return NextResponse.json({ error: "Enter your first and last name" }, { status: 400 });
  }
  if (!isValidPhone(rawPhone)) {
    return NextResponse.json({ error: "Enter a valid contact number" }, { status: 400 });
  }
  const email = rawEmail.trim().toLowerCase();
  const firstName = rawFirstName.trim();
  const lastName = rawLastName.trim();
  const phone = rawPhone.trim();
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
        customer: {
          givenNames: firstName,
          surname: lastName,
          email,
          mobileNumber: phone,
        },
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
    first_name: firstName,
    last_name: lastName,
    phone,
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
