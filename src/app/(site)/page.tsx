import { CutButton } from "@/components/ui/CutButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { HalftoneField } from "@/components/ui/HalftoneField";
import {
  SteeringWheelIcon,
  StopwatchIcon,
  CheckeredFlagIcon,
} from "@/components/icons";
import { ACCENTS } from "@/lib/plans";

const FEATURES = [
  {
    Icon: SteeringWheelIcon,
    accent: ACCENTS.cyan,
    title: "Pit-wall precision",
    body: "Every call is timestamped, logged, and graded. No vague vibes — telemetry-grade entries and exits.",
  },
  {
    Icon: StopwatchIcon,
    accent: ACCENTS.red,
    title: "Zero-latency alerts",
    body: "Signals hit the VIP Telegram channel the moment they fire. You are on the grid before the lights go out.",
  },
  {
    Icon: CheckeredFlagIcon,
    accent: ACCENTS.papaya,
    title: "Full-season strategy",
    body: "Risk playbooks, position sizing, and weekly recaps keep you racing the whole championship, not one lap.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden px-5 py-24">
        <HalftoneField className="[mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
          style={{ background: ACCENTS.cyan }}
        />
        <div className="relative mx-auto max-w-[720px] text-center">
          <p className="mono-label text-[12px] tracking-[0.1em] text-cyan">
            VIP Racing Signal Intelligence
          </p>
          <h1 className="display-skew text-glow-cyan mt-6 text-[clamp(44px,9vw,72px)] leading-[0.95] text-text-primary">
            Start Your Engines
          </h1>
          <p className="mx-auto mt-6 max-w-[46ch] text-[18px] text-text-secondary">
            High-conviction market calls delivered pit-wall fast. Join the VIP
            Telegram channel and race with the strategists.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <CutButton href="/pricing">Join VIP</CutButton>
            <CutButton href="/pricing#leaderboard" variant="ghost">
              View the spec sheet
            </CutButton>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-canvas px-5 py-24 md:px-20">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ Icon, accent, title, body }) => (
            <GlassCard key={title} cut className="overflow-hidden p-8">
              <span
                aria-hidden
                className="absolute right-0 top-0 h-1 w-24 origin-top-right rotate-[-35deg]"
                style={{ background: accent }}
              />
              <Icon className="text-text-primary" style={{ color: accent }} />
              <h3 className="mt-6 font-display text-xl font-semibold uppercase tracking-tight text-text-primary">
                {title}
              </h3>
              <p className="mt-3 text-[15px] text-text-secondary">{body}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </>
  );
}
