import { cn } from "@/lib/cn";

/**
 * 28px square badge. Included → accent-filled with a dark check.
 * Not included → dim outline only.
 */
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
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "inline-grid h-7 w-7 place-items-center border-2",
        !included && "opacity-30",
      )}
      style={{
        borderColor: accent,
        backgroundColor: included ? accent : "transparent",
      }}
    >
      {included ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="#0B0E17"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
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
