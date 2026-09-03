"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CutButton } from "@/components/ui/CutButton";
import { PaymentLogos } from "@/components/checkout/PaymentLogos";
import { ACCENTS, formatPrice, type TierId } from "@/lib/plans";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s-]{6,19}$/;

const INPUT =
  "w-full border border-panel-border bg-black/20 px-4 py-3 font-body text-[15px] text-text-primary outline-none focus:border-cyan";
const LABEL =
  "mono-label mb-2 block text-[11px] tracking-[0.08em] text-text-secondary";

const STEPS = [
  {
    n: 1,
    accent: ACCENTS.cyan,
    title: "Fill out the form",
    body: "Enter your name, email, and mobile number.",
  },
  {
    n: 2,
    accent: ACCENTS.red,
    title: "Check out",
    body: "Pay securely with e-wallet, card, or online banking.",
  },
  {
    n: 3,
    accent: ACCENTS.papaya,
    title: "Get your invite link",
    body: "Your single-use VIP Telegram invite is emailed to you — also on the confirmation page and at /status.",
  },
];

export function CheckoutForm({
  tier,
  name,
  tagline,
  price,
  accent,
}: {
  tier: TierId;
  name: string;
  tagline: string;
  price: number;
  accent: string;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = `₱${formatPrice(price)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter your first and last name");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email");
      return;
    }
    if (!PHONE_RE.test(phone.trim())) {
      setError("Enter a valid contact number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tier,
          email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
        }),
      });
      const data = (await res.json()) as { invoiceUrl?: string; error?: string };
      if (!res.ok || !data.invoiceUrl) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.invoiceUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-canvas px-5 py-16 md:px-20">
      <p className="mono-label text-[12px] tracking-[0.1em] text-cyan">
        Secure Checkout
      </p>
      <h1 className="display-skew mt-3 text-[clamp(28px,6vw,44px)] text-text-primary">
        Complete your entry
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT — details + summary */}
        <GlassCard cut className="p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="mono-label text-[11px] tracking-[0.1em] text-text-primary">
              02 / Your details
            </p>
            <p className="mono-label text-[11px] tracking-[0.1em] text-text-secondary">
              Secure checkout
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className={LABEL}>
                  First name <span className="text-red">*</span>
                </label>
                <input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  className={INPUT}
                />
              </div>
              <div>
                <label htmlFor="lastName" className={LABEL}>
                  Last name <span className="text-red">*</span>
                </label>
                <input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dela Cruz"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={LABEL}>
                Email <span className="text-red">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className={INPUT}
              />
            </div>

            <div>
              <label htmlFor="phone" className={LABEL}>
                Contact # <span className="text-red">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 900 000 0000"
                className={INPUT}
              />
            </div>

            <div className="flex items-center justify-between border border-panel-border px-4 py-3">
              <span className="mono-label text-[11px] tracking-[0.06em] text-text-secondary">
                {name} — lifetime access
              </span>
              <span className="font-mono text-[15px] text-text-primary">
                {amount}
              </span>
            </div>

            <div className="h-px w-full bg-panel-border" />

            <div className="flex items-center justify-between text-[13px]">
              <span className="mono-label text-text-secondary">Subtotal</span>
              <span className="font-mono text-text-primary">{amount}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="mono-label text-[12px] text-text-secondary">
                Total
              </span>
              <span className="font-mono text-[28px] leading-none tracking-tight tabular-nums text-text-primary">
                {amount}{" "}
                <span className="text-[13px] tracking-normal text-text-secondary">
                  PHP
                </span>
              </span>
            </div>

            <CutButton
              type="submit"
              variant="primary"
              accentColor={accent}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Lights out…" : `Pay ${amount}`}
            </CutButton>

            {error ? (
              <p className="mono-label text-[12px] text-red">{error}</p>
            ) : (
              <p className="mono-label text-[11px] text-text-secondary">
                Payments processed by Xendit
              </p>
            )}
          </form>
        </GlassCard>

        {/* RIGHT — how it works */}
        <GlassCard cut className="flex flex-col gap-6 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <p className="mono-label text-[11px] tracking-[0.1em] text-text-primary">
              03 / How it works
            </p>
            <p className="mono-label text-[11px] tracking-[0.1em] text-text-secondary">
              3 steps
            </p>
          </div>

          <ol className="space-y-5">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span
                  className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center font-mono text-[14px] font-bold text-ink-900"
                  style={{ backgroundColor: s.accent }}
                >
                  {s.n}
                </span>
                <div>
                  <p className="font-display text-[15px] font-semibold uppercase tracking-tight text-text-primary">
                    {s.title}
                  </p>
                  <p className="mt-1 text-[13px] text-text-secondary">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <PaymentLogos />
        </GlassCard>
      </div>

      <p className="mono-label mt-6 text-[11px] text-text-secondary">
        {tagline} · one-time payment, no subscription.
      </p>
    </section>
  );
}
