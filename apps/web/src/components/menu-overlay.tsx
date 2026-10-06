"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@repo/ui";

type LinkItem = { href: string; label: string; index?: string };
type ProfileBits = { socials: { github: string; linkedin: string }; cv: string };

/** Right-edge sidebar drawer for small screens (portaled — escapes header blur). */
export function MenuOverlay({
  profile,
  links,
}: {
  profile: ProfileBits;
  links: LinkItem[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer =
    mounted &&
    createPortal(
      <div className="md:hidden" aria-hidden={!open}>
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 z-[80] bg-black/60 transition-opacity duration-300 ease-out",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "fixed inset-y-0 right-0 z-[90] flex w-[min(17rem,78vw)] flex-col border-l border-line bg-black shadow-[-24px_0_48px_rgba(0,0,0,0.55)] transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "pointer-events-none translate-x-full",
          )}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-soft">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="grid size-9 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent"
            >
              <span className="relative block size-3.5">
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 rotate-45 bg-text" />
                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 -rotate-45 bg-text" />
              </span>
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3" aria-label="Mobile">
            {links.map((link, i) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-baseline gap-3 rounded-lg px-3 py-2.5 font-display text-[1.45rem] leading-none tracking-tight transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-text hover:bg-white/[0.04] hover:text-accent",
                  )}
                >
                  <span className="font-mono text-[10px] text-muted-soft">
                    {link.index ?? String(i).padStart(2, "0")}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap gap-4 border-t border-line px-5 py-4 font-mono text-[11px] text-muted">
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="hover:text-accent">
              GitHub ↗
            </a>
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent">
              LinkedIn ↗
            </a>
            <a href={profile.cv} target="_blank" className="hover:text-accent">
              CV ↓
            </a>
          </div>
        </aside>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative z-[70] grid size-10 place-items-center rounded-full border border-line-strong transition-colors duration-200 hover:border-accent md:hidden"
      >
        <span className="relative block h-3 w-[15px]" aria-hidden>
          <span
            className={cn(
              "absolute left-0 top-0 h-px w-full origin-center bg-text transition-all duration-300 ease-out",
              open && "top-1.5 rotate-45",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1.5 h-px w-full bg-text transition-all duration-200 ease-out",
              open && "scale-x-0 opacity-0",
            )}
          />
          <span
            className={cn(
              "absolute bottom-0 left-0 h-px w-full origin-center bg-text transition-all duration-300 ease-out",
              open && "bottom-1.5 -rotate-45",
            )}
          />
        </span>
      </button>
      {drawer}
    </>
  );
}
