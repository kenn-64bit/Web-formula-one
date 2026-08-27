"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { CutButton } from "@/components/ui/CutButton";
import { CopyField } from "@/components/CopyField";
import { PLANS, isTierId } from "@/lib/plans";

type Purchase = { tier: string | null; inviteLink: string | null; paidAt: string | null };

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Purchase[] | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { purchases?: Purchase[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Lookup failed");
      setResult(json.purchases ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto min-h-[70vh] max-w-[640px] px-5 py-24">
      <p className="mono-label text-[12px] tracking-[0.1em] text-cyan">My Access</p>
      <h1 className="display-skew mt-3 text-[clamp(28px,6vw,44px)] text-text-primary">
        Find your invite link
      </h1>
      <p className="mt-3 text-[15px] text-text-secondary">
        Enter the email you paid with to re-fetch your VIP Telegram invite.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 border border-panel-border bg-black/20 px-4 py-3 font-body text-[15px] text-text-primary outline-none focus:border-cyan"
        />
        <CutButton type="submit" disabled={loading}>
          {loading ? "Checking…" : "Look up"}
        </CutButton>
      </form>

      {error ? (
        <p className="mono-label mt-4 text-[12px] text-red">{error}</p>
      ) : null}

      {result && result.length === 0 ? (
        <p className="mt-8 text-[15px] text-text-secondary">
          No active VIP purchase found for that email.
        </p>
      ) : null}

      {result && result.length > 0 ? (
        <div className="mt-8 space-y-4">
          {result.map((p, i) => {
            const name =
              p.tier && isTierId(p.tier) ? PLANS[p.tier].name : "VIP";
            return (
              <GlassCard key={i} cut className="p-6">
                <p className="font-display text-lg font-bold uppercase text-text-primary">
                  {name}
                </p>
                {p.inviteLink ? (
                  <CopyField value={p.inviteLink} />
                ) : (
                  <p className="mono-label mt-2 text-[11px] text-text-secondary">
                    Invite link not yet generated — check back shortly.
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
