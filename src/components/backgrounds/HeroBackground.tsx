"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { HalftoneField } from "@/components/ui/HalftoneField";
import { ACCENTS } from "@/lib/plans";

const GridDistortion = dynamic(() => import("./GridDistortion"), { ssr: false });

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Hero backdrop: an animated WebGL grid-distortion field, with a static
 * halftone + glow fallback for reduced-motion / no-WebGL.
 */
export function HeroBackground() {
  const reduced = useReducedMotion();

  return (
    <>
      {reduced ? (
        <HalftoneField className="[mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
      ) : (
        <>
          <GridDistortion className="absolute inset-0" />
          {/* light scrim so the headline keeps contrast over the moving grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-ink-900/20 [mask-image:radial-gradient(60%_55%_at_50%_45%,black,transparent_75%)]"
          />
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: ACCENTS.cyan }}
      />
    </>
  );
}
