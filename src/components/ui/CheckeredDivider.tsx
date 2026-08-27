import { cn } from "@/lib/cn";

export function CheckeredDivider({ className }: { className?: string }) {
  return <div aria-hidden className={cn("checker-divider", className)} />;
}
