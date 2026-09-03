"use client";

import { useId, useState } from "react";
import { CutButton } from "@/components/ui/CutButton";
import { Modal } from "@/components/ui/Modal";
import { FlagGlyph } from "@/components/icons";
import { PLANS, formatPrice, type TierId } from "@/lib/plans";

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
  const titleId = useId();
  const plan = PLANS[tier];

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

      <Modal open={open} onClose={() => setOpen(false)} labelledBy={titleId}>
        <p className="mono-label text-[11px] tracking-[0.1em] text-cyan">
          01 / Your entry
        </p>
        <h2
          id={titleId}
          className="display-skew mt-2 text-[26px] text-text-primary"
        >
          {plan.name}
        </h2>
        <p className="mt-1 text-[14px] text-text-secondary">{plan.tagline}</p>

        <div className="mt-5 flex items-baseline gap-2">
          <span className="font-mono text-[40px] leading-none text-text-primary">
            &#8369;{formatPrice(plan.price)}
          </span>
          <span className="text-[14px] text-text-secondary">PHP</span>
        </div>
        <p className="mono-label mt-2 text-[11px] text-text-secondary">
          One-time &middot; lifetime access
        </p>

        <div className="my-5 h-px w-full bg-panel-border" />

        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 text-[13px] text-text-primary"
            >
              <span className="mt-1 shrink-0" style={{ color: plan.accent }}>
                <FlagGlyph />
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-col gap-3">
          <CutButton
            href={`/checkout?tier=${tier}`}
            variant={variant}
            accentColor={accentColor}
            className="w-full"
          >
            Proceed to checkout
          </CutButton>
          <CutButton
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Cancel
          </CutButton>
        </div>
      </Modal>
    </div>
  );
}
