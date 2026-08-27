"use client";

import { useState } from "react";
import { CutButton } from "@/components/ui/CutButton";
import type { TierId } from "@/lib/plans";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutButton({
  tier,
  accentColor,
  variant = "accent",
  children,
  className,
}: {
  tier: TierId;
  accentColor?: string;
  variant?: "primary" | "accent";
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier, email }),
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

  if (!open) {
    return (
      <div className={className}>
        <CutButton
          variant={variant}
          accentColor={accentColor}
          onClick={() => setOpen(true)}
          className="w-full"
        >
          {children}
        </CutButton>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={className}>
      <input
        type="email"
        autoFocus
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="mb-2 w-full border border-panel-border bg-black/20 px-3 py-2 font-body text-[14px] text-text-primary outline-none focus:border-cyan"
      />
      <CutButton
        type="submit"
        variant={variant}
        accentColor={accentColor}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Lights out…" : "Continue to payment"}
      </CutButton>
      {error ? (
        <p className="mono-label mt-2 text-[11px] text-red">{error}</p>
      ) : (
        <p className="mono-label mt-2 text-[11px] text-text-secondary">
          Your invite link is emailed here after payment.
        </p>
      )}
    </form>
  );
}
