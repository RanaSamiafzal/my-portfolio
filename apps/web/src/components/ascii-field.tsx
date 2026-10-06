"use client";

import { useEffect, useRef } from "react";
import { prefersLiteExperience } from "@/lib/media";

const RAMP = " .:-=+*#%@";

/** Animated ASCII interference field used behind the contact CTA. Skipped on mobile. */
export function AsciiField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (prefersLiteExperience()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cw = 9;
    const ch = 14;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `12px ${getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"}, monospace`;
      ctx.textBaseline = "top";
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = Boolean(e?.isIntersecting)));
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || now - last < 80) return;
      last = now;
      const t = now / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / cw);
      const rows = Math.ceil(h / ch);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x / cols;
          const ny = y / rows;
          const v =
            Math.sin(nx * 9 + t * 0.9) * 0.35 +
            Math.sin(ny * 7 - t * 0.7 + nx * 3) * 0.35 +
            Math.sin((nx + ny) * 12 + t * 1.3) * 0.3;
          const n = (v + 1) / 2;
          const idx = Math.floor(n * (RAMP.length - 1));
          if (idx < 2) continue;
          ctx.fillStyle = `rgba(0,255,65,${0.08 + n * 0.35})`;
          ctx.fillText(RAMP[idx]!, x * cw, y * ch);
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} className={`hidden md:block ${className ?? ""}`} aria-hidden />;
}
