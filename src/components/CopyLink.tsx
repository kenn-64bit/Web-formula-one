"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-4 flex items-center gap-3">
      <code className="flex-1 truncate border border-panel-border bg-black/20 px-3 py-2 font-mono text-[13px] text-text-primary">
        {url}
      </code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="mono-label cut-br bg-cyan px-4 py-2 text-[12px] text-ink-900"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
