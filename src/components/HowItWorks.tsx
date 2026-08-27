import { HalftoneField } from "@/components/ui/HalftoneField";
import { ACCENTS } from "@/lib/plans";

const STEPS = [
  {
    n: "01",
    accent: ACCENTS.cyan,
    title: "Pick your chassis",
    body: "Choose the tier that matches your pace. Move up or drop back between cycles with no penalty.",
  },
  {
    n: "02",
    accent: ACCENTS.red,
    title: "Clear the pit lane",
    body: "Checkout runs through Xendit. Your seat is confirmed the moment the payment lands — 30 days on the clock.",
  },
  {
    n: "03",
    accent: ACCENTS.papaya,
    title: "Join the grid",
    body: "A single-use invite drops you straight into the VIP Telegram channel, live with the strategists.",
  },
];

/**
 * Bridge band between the feature grid and the pricing podium. Shares the page
 * gradient, mono numerals, and cyan/red/papaya accent cycle so it reads as one
 * continuous broadcast package. The lower halftone glow leads the eye into the
 * "Choose Your Chassis" heading directly below.
 */
export function HowItWorks() {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-8 md:px-20">
      <div className="mx-auto max-w-canvas">
        <p className="mono-label text-center text-[12px] tracking-[0.1em] text-cyan">
          Starting Procedure
        </p>
        <h2 className="display-skew mx-auto mt-4 max-w-[20ch] text-center text-[clamp(28px,5vw,40px)] leading-[1.05] text-text-primary">
          From formation lap to flag
        </h2>

        {/* start-line */}
        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[7px] hidden h-px bg-panel-border md:block"
          />
          {STEPS.map((step) => (
            <div key={step.n} className="relative">
              <span
                aria-hidden
                className="block h-3.5 w-3.5 rounded-full ring-4 ring-ink-900"
                style={{ background: step.accent }}
              />
              <p
                className="mt-5 font-mono text-[22px] tabular-nums"
                style={{ color: step.accent }}
              >
                {step.n}
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold uppercase tracking-tight text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[38ch] text-[14px] text-text-secondary">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* fade into the podium below */}
      <HalftoneField
        tint={ACCENTS.cyan}
        className="top-1/2 opacity-[0.18] [mask-image:radial-gradient(80%_120%_at_50%_100%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-24 w-px bg-gradient-to-b from-transparent to-cyan/40"
      />
    </section>
  );
}
