"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

const noop = () => () => {};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
};

/**
 * Bare, dependency-free dialog. Portals to <body>, locks page scroll, closes on
 * Esc / backdrop click, and restores focus to the trigger on close. Styled to
 * match GlassCard (cut corner, glass border, ink fill).
 */
export function Modal({ open, onClose, children, className, labelledBy }: ModalProps) {
  // false on the server, true once mounted on the client — keeps the portal out
  // of SSR without a setState-in-effect.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          "cut-br relative max-h-[calc(100vh-2.5rem)] w-[440px] max-w-full overflow-y-auto border border-panel-border bg-ink-900/95 p-8 outline-none backdrop-blur-[24px]",
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
