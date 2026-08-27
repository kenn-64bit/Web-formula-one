"use client";

import { useState } from "react";
import { CutButton } from "@/components/ui/CutButton";
import type { TierId } from "@/lib/plans";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = (await res.json()) as { invoiceUrl?: string; error?: string };
      if (res.status === 401) {
        setError("Sign-in required — accounts are coming soon.");
        setLoading(false);
        return;
      }
      if (!res.ok || !data.invoiceUrl) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.invoiceUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <CutButton
        variant={variant}
        accentColor={accentColor}
        onClick={go}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Lights out…" : children}
      </CutButton>
      {error ? (
        <p className="mono-label mt-2 text-[11px] text-red">{error}</p>
      ) : null}
    </div>
  );
}
