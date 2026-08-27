import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { HalftoneField } from "@/components/ui/HalftoneField";
import { RpmBar } from "@/components/ui/RpmBar";
import { CutButton } from "@/components/ui/CutButton";
import { CopyLink } from "@/components/CopyLink";
import { PLANS, type TierId } from "@/lib/plans";
import {
  daysRemaining,
  MOCK_SUBSCRIPTION,
  type SubscriptionRow,
} from "@/lib/subscription";
import { PREVIEW_MODE } from "@/lib/preview";

export const metadata: Metadata = { title: "Pit Wall — APEX Signals" };

function Widget({
  label,
  value,
  caption,
  progress,
}: {
  label: string;
  value: string;
  caption: string;
  progress: number;
}) {
  return (
    <GlassCard cut className="p-6">
      <p className="mono-label text-[12px] text-text-secondary">{label}</p>
      <p className="mt-2 font-mono text-[36px] leading-none text-text-primary">
        {value}
      </p>
      <p className="mt-1 text-[13px] text-text-secondary">{caption}</p>
      <RpmBar value={progress} className="mt-4" />
    </GlassCard>
  );
}

export default async function DashboardPage() {
  let sub: SubscriptionRow | null;

  if (PREVIEW_MODE) {
    sub = MOCK_SUBSCRIPTION;
  } else {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login?next=/dashboard");

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    sub = data as SubscriptionRow | null;
  }

  const tier: TierId = sub?.tier ?? "podium";
  const plan = PLANS[tier];
  const status = sub?.status ?? "inactive";
  const isActive = status === "active";

  const days = daysRemaining(sub?.current_period_end ?? null);
  const timePct = (days / plan.durationDays) * 100;

  const usage = sub?.usage_count ?? 0;
  const usageLimit = sub?.usage_limit ?? 100;
  const usagePct = usageLimit ? (usage / usageLimit) * 100 : 0;

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <h1 className="display-skew text-3xl text-text-primary">Pit Wall</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Live subscription telemetry.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Widget
          label="Signal Usage"
          value={`${usage}/${usageLimit}`}
          caption="signals opened this cycle"
          progress={usagePct}
        />
        <Widget
          label="Time Remaining"
          value={`${days}d`}
          caption={`renews / ends ${renewalDate}`}
          progress={timePct}
        />
        <Widget
          label="Status"
          value={status.toUpperCase()}
          caption={isActive ? "VIP channel access live" : "no active access"}
          progress={isActive ? 100 : 0}
        />
      </div>

      {isActive && sub?.invite_link ? (
        <GlassCard cut className="mt-6 p-6">
          <p className="mono-label text-[12px] text-cyan">Your VIP Channel</p>
          <p className="mt-2 text-[14px] text-text-secondary">
            Single-use invite link — opens the VIP Signals channel. Do not share.
          </p>
          <CopyLink url={sub.invite_link} />
        </GlassCard>
      ) : null}

      {/* PIT STOP */}
      <div className="relative mt-12 overflow-hidden">
        <GlassCard cut className="relative overflow-hidden p-8">
          <HalftoneField className="[mask-image:radial-gradient(80%_120%_at_100%_0%,black,transparent)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="mono-label text-[12px] text-text-secondary">
                Pit Stop — Plan Management
              </p>
              <p className="mt-2 font-display text-2xl font-bold uppercase text-text-primary">
                {plan.name} Chassis
              </p>
              <p className="mt-1 font-mono text-[13px] text-text-secondary">
                Renewal date: {renewalDate}
              </p>
            </div>
            <CutButton href="/pricing">Pit Stop: Upgrade Plan</CutButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
