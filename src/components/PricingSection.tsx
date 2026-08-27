import { GlassCard } from "@/components/ui/GlassCard";
import { HalftoneField } from "@/components/ui/HalftoneField";
import { FeatureBadge, Pill } from "@/components/ui/Badge";
import { FlagGlyph } from "@/components/icons";
import { CheckoutButton } from "@/components/CheckoutButton";
import {
  PLANS,
  PLAN_LIST,
  LEADERBOARD,
  formatIDR,
  type Plan,
} from "@/lib/plans";
import { cn } from "@/lib/cn";

function PodiumCard({ plan }: { plan: Plan }) {
  const isP1 = plan.position === 1;
  return (
    <GlassCard
      cut
      className={cn(
        "relative flex flex-col overflow-hidden p-8",
        isP1 && "md:-mt-12 md:pb-20",
      )}
      style={{
        borderColor: plan.accent,
        boxShadow: isP1 ? `0 0 24px ${plan.accent}59` : undefined,
      }}
    >
      {isP1 && <HalftoneField tint={plan.accent} />}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-4 bottom-0 select-none font-display text-[220px] font-bold leading-none text-white/[0.06]"
      >
        {plan.position}
      </span>

      <div className="relative">
        {isP1 && <Pill accent={plan.accent}>Pole Position</Pill>}
        <h3 className="mt-3 font-display text-[22px] font-bold uppercase tracking-tight text-text-primary">
          {plan.name}
        </h3>
        <p className="mt-1 text-[14px] text-text-secondary">{plan.tagline}</p>

        <div className="mt-6 flex items-baseline gap-2">
          <span className="font-mono text-[56px] leading-none text-text-primary">
            {formatIDR(plan.priceIDR).replace("Rp", "Rp ")}
          </span>
          <span className="text-[14px] text-text-secondary">/mo</span>
        </div>

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
        <div className="grid items-end gap-6 md:grid-cols-3">
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
