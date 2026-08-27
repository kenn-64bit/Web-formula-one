import type { SVGProps } from "react";

const common: SVGProps<SVGSVGElement> = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function SteeringWheelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} {...common} {...props}>
      <circle cx={12} cy={12} r={9} />
      <circle cx={12} cy={12} r={2.4} />
      <path d="M4.5 9.5c4.8-2.2 10.2-2.2 15 0M12 14.4V21M10 13l-4.7 4.2M14 13l4.7 4.2" />
    </svg>
  );
}

export function StopwatchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} {...common} {...props}>
      <circle cx={12} cy={13} r={8} />
      <path d="M12 13V8M12 5V2.5M9.5 2.5h5M18.5 6.5l1.8-1.8" />
    </svg>
  );
}

export function CheckeredFlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} {...common} {...props}>
      <path d="M5 3v18" />
      <path d="M5 4h14v10H5z" />
      <path d="M5 4h4.7v3.3H5zM14.3 4H19v3.3h-4.7zM9.7 7.3h4.6v3.4H9.7zM5 10.7h4.7V14H5zM14.3 10.7H19V14h-4.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Tiny checkered-flag glyph used in place of a checkmark in feature lists. */
export function FlagGlyph({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12} aria-hidden style={{ color }}>
      <rect x={0} y={0} width={6} height={3} fill="currentColor" />
      <rect x={6} y={3} width={6} height={3} fill="currentColor" />
      <rect x={0} y={6} width={6} height={3} fill="currentColor" />
      <rect x={6} y={9} width={6} height={3} fill="currentColor" />
    </svg>
  );
}
