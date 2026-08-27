"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckeredDivider } from "@/components/ui/CheckeredDivider";
import { CutButton } from "@/components/ui/CutButton";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#leaderboard", label: "Spec Sheet" },
  { href: "/status", label: "My Access" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-panel-border bg-panel backdrop-blur-[24px]">
        <div className="mx-auto flex h-14 max-w-canvas items-center justify-between px-5 md:px-20">
          <Link
            href="/"
            className="font-display text-lg font-bold uppercase tracking-tight text-text-primary"
          >
            APEX<span className="text-cyan">/</span>SIGNALS
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => {
              // anchor items (containing "#") never take a persistent underline
              const active = !item.href.includes("#") && pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "mono-label pb-0.5 text-[11px] transition-colors",
                    active
                      ? "border-b-2 border-cyan text-cyan [box-shadow:0_8px_12px_-6px_rgba(0,245,212,0.4)]"
                      : "border-b-2 border-transparent text-text-secondary hover:text-text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <CutButton
            href="/#pricing"
            className="hidden sm:inline-flex [&]:min-h-0 [&]:px-4 [&]:py-1.5 [&]:text-[12px]"
          >
            Enter Pit Lane
          </CutButton>
        </div>
      </div>
      <CheckeredDivider />
    </header>
  );
}
