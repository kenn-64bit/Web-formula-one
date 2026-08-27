"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { CopyField } from "@/components/CopyField";
import { PLANS, isTierId } from "@/lib/plans";

type Purchase = {
  tier: string | null;
  status: "pending" | "active";
  inviteLink: string | null;
};

function SuccessInner() {
  const ref = useSearchParams().get("ref");
  const [data, setData] = useState<Purchase | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!ref) return;
    let tries = 0;
    let stop = false;

    async function poll() {
      tries += 1;
      try {
        const res = await fetch(`/api/purchase?ref=${encodeURIComponent(ref!)}`);
        if (res.ok) {
          const json = (await res.json()) as Purchase;
          if (!stop) setData(json);
          if (json.status === "active") return;
        }
      } catch {
        /* retry */
      }
      if (tries >= 20) {
        if (!stop) setGaveUp(true);
        return;
      }
      if (!stop) setTimeout(poll, 4000);
    }
    poll();
    return () => {
      stop = true;
    };
  }, [ref]);

  const tierName =
    data?.tier && isTierId(data.tier) ? PLANS[data.tier].name : "VIP";

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col justify-center px-5 py-24">
      <p className="mono-label text-[12px] tracking-[0.1em] text-cyan">
        Payment received
      </p>
      <h1 className="display-skew mt-3 text-[clamp(28px,6vw,44px)] text-text-primary">
        {data?.status === "active" ? "You're on the grid" : "Confirming payment"}
      </h1>

      {data?.status === "active" && data.inviteLink ? (
        <GlassCard cut className="mt-8 p-6">
          <p className="text-[15px] text-text-primary">
            {tierName} — lifetime access. Your single-use invite to the VIP
            Signals channel:
          </p>
          <CopyField value={data.inviteLink} />
          <p className="mono-label mt-3 text-[11px] text-text-secondary">
            Also sent to your email. Re-find it any time at{" "}
            <Link href="/status" className="text-cyan">
              /status
            </Link>
            .
          </p>
        </GlassCard>
      ) : (
        <p className="mt-6 max-w-[46ch] text-[16px] text-text-secondary">
          {gaveUp
            ? "This is taking longer than usual. Your invite link has been emailed to you — check your inbox, or look it up on the "
            : "Generating your VIP invite link. It's also on the way to your email…"}
          {gaveUp ? (
            <Link href="/status" className="text-cyan">
              My Access
            </Link>
          ) : null}
          {gaveUp ? " page." : null}
        </p>
      )}

      {!ref ? (
        <p className="mt-6 text-[15px] text-red">Missing payment reference.</p>
      ) : null}
    </section>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
