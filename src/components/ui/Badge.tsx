import { cn } from "@/lib/cn";

/** 28px square badge — filled if `included`, outline-only if not. */
export function FeatureBadge({
  included,
  accent,
  label,
}: {
  included: boolean;
  accent: string;
  label: string;
}) {
  return (
    <span
      title={label}
      className={cn("inline-block h-7 w-7 border-2")}
      style={{
        borderColor: accent,
        backgroundColor: included ? accent : "transparent",
      }}
    />
  );
}

/** Small diagonal-cut pill, e.g. "POLE POSITION". */
export function Pill({
  children,
  accent = "#00f5d4",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <span
      className="cut-br mono-label inline-block px-3 py-1 text-[11px] font-medium text-ink-900"
      style={{ backgroundColor: accent }}
    >
      {children}
    </span>
  );
}
