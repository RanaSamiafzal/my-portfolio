"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@repo/ui";

type Row = { name: string; count: number; pct: number; projects: string[] };

const BLOCKS = 24;
const MOBILE_LIMIT = 6;

/** Pixel-block usage bars: how many of my projects use each technology. */
export function StackUsage({ rows, total }: { rows: Row[]; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<string | null>(rows[0]?.name ?? null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = rows.find((r) => r.name === active);
  const hasMore = rows.length > MOBILE_LIMIT;

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
      <div>
        <ul className="space-y-0.5">
          {rows.map((r, i) => {
            const lit = Math.round((r.pct / 100) * BLOCKS);
            return (
              <li key={r.name} className={cn(i >= MOBILE_LIMIT && !expanded && "max-lg:hidden")}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(r.name)}
                  onFocus={() => setActive(r.name)}
                  onClick={() => setActive(r.name)}
                  className={cn(
                    "grid w-full grid-cols-[minmax(72px,88px)_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors sm:grid-cols-[120px_1fr_64px] sm:gap-4 sm:rounded-lg sm:px-3 sm:py-2 lg:grid-cols-[150px_1fr_80px]",
                    active === r.name ? "bg-bg-2" : "hover:bg-bg-1",
                  )}
                >
                  <span className={cn("truncate text-[13px] sm:text-[15px]", active === r.name ? "text-accent" : "text-text")}>
                    {r.name}
                  </span>
                  <span className="flex gap-px sm:gap-[3px]" aria-hidden>
                    {Array.from({ length: BLOCKS }, (_, b) => (
                      <span
                        key={b}
                        className={cn(
                          "h-2 flex-1 rounded-[1px] transition-colors sm:h-3",
                          b < lit && shown
                            ? b === lit - 1
                              ? "bg-[#b8ffc6] shadow-[0_0_8px_#00ff41]"
                              : "bg-accent"
                            : "bg-white/[0.06]",
                        )}
                        style={{ transitionDuration: "120ms", transitionDelay: shown ? `${i * 40 + b * 12}ms` : "0ms" }}
                      />
                    ))}
                  </span>
                  <span className="whitespace-nowrap text-right font-mono text-[10px] text-muted sm:text-xs">
                    {r.count}/{total}
                    <span className="hidden text-muted-soft sm:inline"> · {r.pct}%</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="link-mono mt-3 lg:hidden"
          >
            {expanded ? "Show less ↑" : `Show all ${rows.length} →`}
          </button>
        )}
      </div>

      <div className="card h-fit p-4 sm:p-6 lg:sticky lg:top-28">
        <p className="mono-label">Used in</p>
        <p className="mt-2 font-display text-2xl tracking-tight text-accent sm:mt-3 sm:text-3xl">{current?.name}</p>
        <p className="mt-1 font-mono text-[11px] text-muted-soft sm:text-xs">
          {current?.count} of {total} projects · {current?.pct}%
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 sm:mt-6 sm:block sm:space-y-2 sm:gap-0">
          {current?.projects.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm text-muted sm:gap-3 sm:text-base">
              <span className="size-1.5 shrink-0 bg-accent shadow-[0_0_6px_#00ff41]" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
