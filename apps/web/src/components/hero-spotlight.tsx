"use client";

import { useEffect, useRef } from "react";
import { prefersLiteExperience } from "@/lib/media";

/** A soft phosphor glow that follows the pointer across its parent section. Desktop only. */
export function HeroSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || prefersLiteExperience()) return;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => (el.style.opacity = "0");
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 hidden opacity-0 transition-opacity duration-500 lg:block"
      style={{ background: "radial-gradient(420px circle at var(--x) var(--y), rgba(0,255,65,0.09), transparent 70%)" }}
    />
  );
}
