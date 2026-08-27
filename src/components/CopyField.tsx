"use client";

import { useState } from "react";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2">
      <code className="flex-1 truncate border border-panel-border bg-black/20 px-3 py-2 font-mono text-[13px] text-text-primary">
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* clipboard unavailable */
          }
        }}
        className="mono-label cut-br bg-cyan px-4 py-2 text-[12px] text-ink-900"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
