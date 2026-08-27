import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  cut?: boolean;
};

export function GlassCard({ cut = false, className, children, ...rest }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative border border-panel-border bg-panel backdrop-blur-[24px]",
        cut && "cut-br",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
