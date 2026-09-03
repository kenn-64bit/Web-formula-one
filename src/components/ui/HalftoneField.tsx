import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /** any CSS color — the dots use currentColor */
  tint?: string;
};

/** Radial dot-matrix motif. Absolutely positioned; give the parent `relative`. */
export function HalftoneField({ className, tint = "#e4b24a" }: Props) {
  return (
    <div
      aria-hidden
      className={cn("halftone pointer-events-none absolute inset-0", className)}
      style={{ color: tint }}
    />
  );
}
