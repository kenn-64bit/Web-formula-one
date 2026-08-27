"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
  const [activeHash, setActiveHash] = useState<string | null>(null);

  // scroll-spy: highlight the nav anchor whose section is in view
  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash(null);
      return;
    }

    const ids = NAV.map((i) => i.href.split("#")[1]).filter(Boolean) as string[];
    const getSections = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);

    // active = the last tracked section whose start has scrolled past the
    // header line; nothing past it yet → no hash (Home stays lit)
    const compute = () => {
      const line = 120; // px below viewport top
      let current: string | null = null;
      for (const el of getSections()) {
        if (el.getBoundingClientRect().top <= line) current = `#${el.id}`;
      }
      setActiveHash(current);
    };

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-panel-border bg-panel backdrop-blur-[24px]">
        <div className="mx-auto flex h-16 max-w-canvas items-center justify-between px-5 md:px-20">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold uppercase tracking-tight text-text-primary"
          >
            <Image
              src="/logo.png"
              alt="Basic FX"
              width={40}
              height={60}
              priority
              className="h-12 w-auto"
            />
            Basic FX
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => {
              const hash = item.href.includes("#")
                ? `#${item.href.split("#")[1]}`
                : null;
              const active = hash
                ? pathname === "/" && activeHash === hash
                : pathname === item.href && !activeHash;
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
