import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "accent";

const base =
  "cut-br inline-flex min-h-[44px] items-center justify-center px-6 py-3 font-body text-[15px] font-medium uppercase tracking-wide transition-colors disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-cyan text-ink-900 hover:bg-cyan/85",
  accent: "text-ink-900 hover:opacity-90",
  ghost:
    "border border-panel-border bg-transparent text-text-primary hover:border-cyan hover:text-cyan",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  accentColor?: string;
};

type AsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & { href: string; children: React.ReactNode };

export function CutButton(props: AsButton | AsLink) {
  const { variant = "primary", className, accentColor, children } = props;
  const style =
    variant === "accent" && accentColor ? { backgroundColor: accentColor } : undefined;
  const cls = cn(base, variants[variant], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={cls} style={style}>
        {children}
      </Link>
    );
  }

  const rest = { ...(props as AsButton) };
  delete rest.href;
  delete (rest as Partial<CommonProps>).variant;
  delete (rest as Partial<CommonProps>).accentColor;
  delete rest.className;
  return (
    <button className={cls} style={style} {...rest}>
      {children}
    </button>
  );
}
