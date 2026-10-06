import type { ComponentPropsWithoutRef, ReactNode } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** "01 / SELECTED WORK" label used above section headings. */
export function SectionLabel({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em] text-muted-soft", className)}>
      {index && (
        <>
          <span className="text-accent">{index}</span>
          <span className="mx-2">/</span>
        </>
      )}
      {children}
    </p>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-bg-1 px-2 py-0.5 font-mono text-[11px] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Pill({ children, className, active, ...rest }: ComponentPropsWithoutRef<"button"> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs transition-all duration-200",
        active
          ? "border-accent/70 bg-accent/10 text-accent shadow-[0_0_18px_-4px_rgba(0,255,65,0.5)]"
          : "border-line-strong text-muted hover:border-line-bright hover:text-text",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ children, className, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("card", className)} {...rest}>
      {children}
    </div>
  );
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2", className)} aria-hidden>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-accent shadow-[0_0_8px_#00ff41]" />
    </span>
  );
}
