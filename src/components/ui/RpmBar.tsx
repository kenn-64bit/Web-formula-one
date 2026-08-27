import { cn } from "@/lib/cn";

const SEGMENTS = 12;

type Props = {
  /** 0–100 */
  value: number;
  className?: string;
};

/** 12-segment rev-limiter bar. Last 2 segments turn red once value > 90%. */
export function RpmBar({ value, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const litCount = Math.round((clamped / 100) * SEGMENTS);
  const redline = clamped > 90;

  return (
    <div className={cn("flex gap-1", className)} role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: SEGMENTS }).map((_, i) => {
        const lit = i < litCount;
        const isRedSegment = i >= SEGMENTS - 2;
        const color = !lit
          ? "bg-white/10"
          : redline && isRedSegment
            ? "bg-red"
            : "bg-cyan";
        return <span key={i} className={cn("h-2 flex-1", color)} />;
      })}
    </div>
  );
}
