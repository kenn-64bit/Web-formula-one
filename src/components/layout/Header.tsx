"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckeredDivider } from "@/components/ui/CheckeredDivider";
import { CutButton } from "@/components/ui/CutButton";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Spec Sheet" },
  { href: "/login", label: "Paddock" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-panel-border bg-panel backdrop-blur-[24px]">
        <div className="mx-auto flex h-20 max-w-canvas items-center justify-between px-5 md:px-20">
          <Link
            href="/"
            className="font-display text-2xl font-bold uppercase tracking-tight text-text-primary"
          >
            APEX<span className="text-cyan">/</span>SIGNALS
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "mono-label pb-1 text-[13px] transition-colors",
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

          <CutButton href="/pricing" className="hidden sm:inline-flex">
            Enter Pit Lane
          </CutButton>
        </div>
      </div>
      <CheckeredDivider />
    </header>
  );
}
