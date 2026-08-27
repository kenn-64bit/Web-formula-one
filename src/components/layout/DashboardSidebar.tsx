"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Telemetry", icon: "▦", href: "/dashboard", active: true },
  { label: "Signals", icon: "◈", href: "/dashboard" },
  { label: "History", icon: "≣", href: "/dashboard" },
  { label: "Strategy", icon: "◇", href: "/dashboard" },
  { label: "Billing", icon: "▤", href: "/pricing" },
  { label: "Settings", icon: "⚙", href: "/dashboard" },
];

export function DashboardSidebar({ email }: { email: string }) {
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-panel-border bg-panel backdrop-blur-[24px] md:flex">
      <div className="px-6 py-6">
        <Link
          href="/"
          className="font-display text-xl font-bold uppercase tracking-tight text-text-primary"
        >
          APEX<span className="text-cyan">/</span>PIT
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {NAV.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className={cn(
              "relative flex h-12 items-center gap-3 rounded-sm px-3 text-[14px] transition-colors",
              item.active
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 h-6 -translate-y-1/2 border-l-[3px] border-cyan [box-shadow:0_0_12px_rgba(0,245,212,0.6)]" />
            )}
            <span
              className={cn(
                "grid w-6 place-items-center text-[16px]",
                item.active && "text-cyan [filter:drop-shadow(0_0_6px_rgba(0,245,212,0.7))]",
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-panel-border px-4 py-4">
        <p className="mono-label truncate text-[11px] text-text-secondary">
          {email}
        </p>
        <button
          onClick={logout}
          className="mono-label mt-2 text-[12px] text-text-secondary transition-colors hover:text-red"
        >
          Log out →
        </button>
      </div>
    </aside>
  );
}
