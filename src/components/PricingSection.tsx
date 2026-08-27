import { GlassCard } from "@/components/ui/GlassCard";
import { HalftoneField } from "@/components/ui/HalftoneField";
import { FeatureBadge, Pill } from "@/components/ui/Badge";
import { FlagGlyph } from "@/components/icons";
import { CheckoutButton } from "@/components/CheckoutButton";
import {
  PLANS,
  PLAN_LIST,
  LEADERBOARD,
  formatPrice,
  type Plan,
} from "@/lib/plans";
import { cn } from "@/lib/cn";

function PodiumCard({ plan }: { plan: Plan }) {
  const isP1 = plan.position === 1;
  return (
    <div
      className={cn("group relative h-full", isP1 && "md:-mt-12")}
      style={{ ["--accent" as string]: plan.accent }}
    >
      {/* accent bloom — sits outside the card's clipped bounds */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-1 z-0 blur-2xl transition-opacity duration-300",
          isP1 ? "opacity-40 group-hover:opacity-70" : "opacity-0 group-hover:opacity-50",
        )}
        style={{ background: plan.accent }}
      />
      <GlassCard
        cut
        className={cn(
          "relative z-10 flex h-full flex-col overflow-hidden p-8 transition-transform duration-300 group-hover:-translate-y-1.5",
          "shadow-[0_0_0_0_transparent] group-hover:shadow-[0_0_44px_-6px_var(--accent)]",
          isP1 && "shadow-[0_0_28px_-4px_var(--accent)] md:pb-20",
        )}
        style={{ borderColor: plan.accent }}
      >
      {isP1 && <HalftoneField tint={plan.accent} />}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 bottom-0 select-none font-display text-[220px] font-bold leading-none text-white/[0.06]"
      >
        {plan.position}
      </span>

      <div className="relative flex flex-1 flex-col">
        {isP1 && <Pill accent={plan.accent}>Pole Position</Pill>}
        <h3 className="mt-3 font-display text-[22px] font-bold uppercase tracking-tight text-text-primary">
          {plan.name}
        </h3>
        <p className="mt-1 text-[14px] text-text-secondary">{plan.tagline}</p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-mono text-[40px] leading-none text-text-primary">
            {formatPrice(plan.price)}
          </span>
          <span className="text-[14px] text-text-secondary">PHP</span>
        </div>
        <p className="mono-label mt-2 text-[11px] text-text-secondary">
          One-time payment
        </p>

        <div className="my-6 h-px w-full bg-panel-border" />

        <ul className="space-y-3">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-[14px] text-text-primary"
            >
              <span className="mt-1 shrink-0" style={{ color: plan.accent }}>
                <FlagGlyph />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <CheckoutButton
        tier={plan.id}
        accentColor={plan.accent}
        variant={isP1 ? "primary" : "accent"}
        className="relative mt-8"
      >
        Join {plan.name}
      </CheckoutButton>
      </GlassCard>
    </div>
  );
}

export function PricingSection() {
  return (
    <>
      {/* PODIUM */}
      <section
        id="pricing"
        className="mx-auto max-w-canvas px-5 pt-20 md:px-20 md:pt-28"
      >
        <h2 className="display-skew mb-12 text-center text-[clamp(24px,4vw,34px)] text-text-primary">
          Choose Your Chassis
        </h2>
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          <PodiumCard plan={PLANS.rookie} />
          <PodiumCard plan={PLANS.podium} />
          <PodiumCard plan={PLANS.constructor} />
        </div>
      </section>

      {/* LEADERBOARD */}
      <section
        id="leaderboard"
        className="mx-auto mt-24 max-w-canvas px-5 pb-24 md:px-20"
      >
        <h2 className="mono-label mb-6 text-[12px] text-text-secondary">
          Classification / Full Spec Sheet
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <colgroup>
              <col className="w-16" />
              <col />
              <col className="w-24" />
              <col className="w-24" />
              <col className="w-24" />
            </colgroup>
            <thead>
              <tr>
                <th className="pb-4 text-left font-mono text-[12px] font-normal text-text-secondary">
                  #
                </th>
                <th className="pb-4 text-left font-body text-[13px] font-normal text-text-secondary">
                  Feature
                </th>
                {PLAN_LIST.map((p) => (
                  <th
                    key={p.id}
                    className="mono-label pb-4 text-center text-[11px] font-medium"
                    style={{ color: p.accent }}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((row, i) => (
                <tr
                  key={row.feature}
                  className="border-t border-b border-[rgba(0,245,212,0.3)]"
                >
                  <td className="h-14 font-mono text-[22px] text-text-secondary">
                    {i + 4}
                  </td>
                  <td className="h-14 pr-4 font-body text-[15px] text-text-primary">
                    {row.feature}
                  </td>
                  {PLAN_LIST.map((p) => (
                    <td key={p.id} className="h-14 text-center align-middle">
                      <FeatureBadge
                        included={row.tiers[p.id]}
                        accent={p.accent}
                        label={`${p.name}: ${row.tiers[p.id] ? "included" : "not included"}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
