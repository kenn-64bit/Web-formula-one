"use client";

import dynamic from "next/dynamic";

const GridDistortion = dynamic(() => import("./GridDistortion"), { ssr: false });

/**
 * Hero backdrop, layered bottom → top:
 *  1. an always-on CSS indigo/violet field (visible even if WebGL / the chunk fails)
 *  2. the WebGL grid-distortion field (covers the CSS layer when it runs)
 *  3. a soft scrim + violet glow for headline contrast
 */
export function HeroBackground() {
  return (
    <>
      <div aria-hidden className="hero-field absolute inset-0" />

      <GridDistortion grid={6} mouse={0.4} className="absolute inset-0" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-ink-900/25 [mask-image:radial-gradient(60%_55%_at_50%_45%,black,transparent_78%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[38%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: "#6D3BD6" }}
      />
    </>
  );
}
