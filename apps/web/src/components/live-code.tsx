"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/ui";

/** Real snippets adapted from my projects; typed out one character at a time. */
const SNIPPETS: { file: string; code: string }[] = [
  {
    file: "ai-engine/ranker.ts",
    code: `export function rankInfluencers(campaign, influencers, topN = 10) {
  const results = influencers.map((inf) => {
    const { score, breakdown } = calculateCompatibility(campaign, inf);
    return { influencerId: inf.id, score, breakdown };
  });
  // explainable: every match ships with its breakdown
  return results.sort((a, b) => b.score - a.score).slice(0, topN);
}`,
  },
  {
    file: "aide/actions.ts",
    code: `async function runAction(tool, args, session) {
  if (!tenant.allowlist.includes(tool.name)) throw new Error("blocked");
  if (tool.writes) {
    const ok = await session.confirm(\`Run \${tool.name}?\`);
    if (!ok) return { status: "cancelled" };
  }
  return tool.call(args); // grounded, audited, reversible
}`,
  },
  {
    file: "core/socket.ts",
    code: `io.on("connection", (socket) => {
  socket.on("join", (projectId) => socket.join(projectId));
  socket.on("message", async ({ projectId, text }) => {
    const msg = await messages.create({ projectId, text });
    io.to(projectId).emit("message:new", msg);
  });
});`,
  },
  {
    file: "payments/escrow.ts",
    code: `export async function releaseDeliverable(id: string) {
  const d = await deliverables.approve(id);
  await stripe.transfers.create({
    amount: d.amount,
    currency: "usd",
    destination: d.influencer.stripeAccountId,
  });
}`,
  },
];

/** Minimal syntax colouring: keywords, strings, comments, function calls. */
function highlight(line: string) {
  const comment = line.indexOf("//");
  const code = comment >= 0 ? line.slice(0, comment) : line;
  const rest = comment >= 0 ? line.slice(comment) : "";
  const parts: React.ReactNode[] = [];
  const re = /("[^"]*"?|`[^`]*`?|'[^']*'?)|\b(export|function|const|return|async|await|if|throw|new|import|from)\b|(\b[a-zA-Z_]+)(?=\()/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) parts.push(code.slice(last, m.index));
    if (m[1]) parts.push(<span key={k++} className="text-[#b8ffc6]">{m[1]}</span>);
    else if (m[2]) parts.push(<span key={k++} className="text-accent">{m[2]}</span>);
    else if (m[3]) parts.push(<span key={k++} className="text-[#86efac]">{m[3]}</span>);
    last = m.index + m[0].length;
  }
  if (last < code.length) parts.push(code.slice(last));
  if (rest) parts.push(<span key={k++} className="text-white/35">{rest}</span>);
  return parts;
}

/**
 * Types code snippets in a loop.
 * - variant "window": a small editor pane, bright and readable.
 * - variant "ghost": a large, faint background layer (kept behind text, low contrast).
 * - variant "holo": perspective screen overlaid on the desk portrait (desktop).
 */
export function LiveCode({
  variant = "window",
  className,
  offset = 0,
  emitKeys = false,
  compact = false,
}: {
  variant?: "window" | "ghost" | "holo";
  className?: string;
  offset?: number;
  /** Broadcast each keystroke (the scan portrait pulses the hands). */
  emitKeys?: boolean;
  /** Shorter pane for mobile overlays. */
  compact?: boolean;
}) {
  const [snippet, setSnippet] = useState(offset % SNIPPETS.length);
  const [chars, setChars] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = Boolean(e?.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Keep the caret in view while typing (vertical + horizontal), like a real editor.
  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    requestAnimationFrame(() => {
      pre.scrollTop = pre.scrollHeight;
      const caret = pre.querySelector<HTMLElement>("[data-caret]");
      if (!caret) return;
      const preRect = pre.getBoundingClientRect();
      const caretRect = caret.getBoundingClientRect();
      const pad = 10;
      if (caretRect.right > preRect.right - pad) {
        pre.scrollLeft += caretRect.right - preRect.right + pad;
      } else if (caretRect.left < preRect.left + pad) {
        pre.scrollLeft -= preRect.left + pad - caretRect.left;
      }
    });
  }, [chars]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const code = SNIPPETS[snippet]!.code;
    if (reduce) {
      setChars(code.length);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let typed = 0;
    setChars(0);
    // Side effects stay out of state updaters (React may run updaters twice in dev).
    const step = () => {
      if (!visible.current) {
        timer = setTimeout(step, 300);
        return;
      }
      if (typed >= code.length) {
        // hold the finished snippet, then move to the next one
        timer = setTimeout(() => setSnippet((s) => (s + 1) % SNIPPETS.length), 2600);
        return;
      }
      const ch = code[typed];
      typed += 1;
      setChars(typed);
      if (emitKeys && ch !== " " && ch !== "\n") window.dispatchEvent(new Event("livecode:key"));
      // Ghost (cyber backdrop) types faster — movie-intro pace. Window/holo stay human-ish.
      const pace = variant === "ghost" ? 0.45 : 1;
      const delay =
        (ch === "\n" ? 180 : /[;{}(),]/.test(ch ?? "") ? 90 : 28 + Math.random() * 45) * pace;
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }, [snippet, emitKeys, variant]);

  const { file, code } = SNIPPETS[snippet]!;
  const typed = code.slice(0, chars);
  const lines = typed.split("\n");

  if (variant === "ghost") {
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(
          "pointer-events-none select-none font-mono text-[15px] leading-[1.75] text-accent/70 [text-shadow:0_0_6px_rgba(0,255,65,0.55),0_0_18px_rgba(0,255,65,0.25)]",
          className,
        )}
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre">
            <span className="mr-2 inline-block w-4 text-right text-accent/35">{String(i + 1).padStart(2, "0")}</span>
            {highlight(l)}
            {i === lines.length - 1 && (
              <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] animate-blink bg-accent align-[-0.12em] shadow-[0_0_12px_#00ff41]" />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (variant === "holo") {
    return (
      <div ref={ref} aria-hidden className={cn("[perspective:900px]", className)}>
        <div className="holo-screen relative origin-left [transform:rotateY(24deg)_rotateX(4deg)]">
          <div className="flex items-center justify-between border-b border-accent/25 px-4 py-2">
            <span className="font-mono text-[10px] tracking-wider text-accent/80">{file}</span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
              <span className="size-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_8px_#00ff41]" /> live
            </span>
          </div>
          <pre
            ref={preRef}
            className="h-[176px] overflow-auto px-4 py-3 font-mono text-[11.5px] leading-[1.65] text-[#cfeedd] [text-shadow:0_0_8px_rgba(0,255,65,0.45)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {lines.map((l, i) => (
              <div key={i} className="flex min-w-max">
                <span className="mr-3 w-4 shrink-0 select-none text-right text-accent/30">{i + 1}</span>
                <span className="whitespace-pre">
                  {highlight(l)}
                  {i === lines.length - 1 && (
                    <span
                      data-caret
                      className="ml-px inline-block h-[1.15em] w-[0.5em] animate-blink bg-accent align-[-0.2em] shadow-[0_0_10px_#00ff41]"
                    />
                  )}
                </span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "overflow-hidden rounded-lg border border-line-strong bg-[#020604]/90 shadow-[0_0_60px_-12px_rgba(0,255,65,0.45)] backdrop-blur-md",
        className,
      )}
    >
      <div className={cn("flex items-center justify-between border-b border-line", compact ? "gap-1 px-2 py-1" : "px-3 py-2")}>
        <span className="flex shrink-0 gap-1">
          <span className={cn("rounded-full bg-white/15", compact ? "size-1.5" : "size-2")} />
          <span className={cn("rounded-full bg-white/15", compact ? "size-1.5" : "size-2")} />
          <span className={cn("rounded-full bg-accent/80", compact ? "size-1.5" : "size-2")} />
        </span>
        <span className={cn("truncate font-mono text-muted-soft", compact ? "max-w-[7.5rem] text-[8px]" : "text-[10px]")}>
          {file}
        </span>
        <span className={cn("flex shrink-0 items-center gap-1 font-mono uppercase tracking-wider text-accent", compact ? "text-[7px]" : "text-[9px]")}>
          <span className="size-1 animate-pulse rounded-full bg-accent" /> live
        </span>
      </div>
      <pre
        ref={preRef}
        className={cn(
          "overflow-auto font-mono leading-[1.55] text-[#d6e2d9] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          compact ? "h-[72px] px-2 py-1.5 text-[8.5px]" : "h-[188px] px-3 py-2.5 text-[11.5px]",
        )}
      >
        {lines.map((l, i) => (
          <div key={i} className="flex min-w-max">
            <span className={cn("shrink-0 select-none text-right text-white/20", compact ? "mr-1.5 w-2.5" : "mr-3 w-4")}>
              {i + 1}
            </span>
            <span className="whitespace-pre">
              {highlight(l)}
              {i === lines.length - 1 && (
                <span
                  data-caret
                  className="ml-px inline-block h-[1.15em] w-[0.45em] animate-blink bg-accent align-[-0.2em] shadow-[0_0_8px_#00ff41]"
                />
              )}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}
