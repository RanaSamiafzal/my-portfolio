"use client";

import { useState } from "react";

export function CopyBlock({ filename, code }: { filename: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-[#0b0f0c]">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs text-muted-soft">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-accent/70" />
          </span>
          {filename}
        </span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="rounded-md border border-line-strong px-2.5 py-1 font-mono text-[11px] text-muted transition-colors hover:border-accent hover:text-accent"
        >
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-[#b8c2cc]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
