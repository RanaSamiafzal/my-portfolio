"use client";

import { useEffect, useRef } from "react";
import { prefersLiteExperience } from "@/lib/media";

/** A band of flickering phosphor blocks between sections. Static on mobile. */
export function GlitchDivider() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (prefersLiteExperience()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cell = 6;
    let cols = 0;
    let rows = 0;
    let seed: Float32Array = new Float32Array(0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(canvas.clientWidth / cell);
      rows = Math.ceil(canvas.clientHeight / cell);
      seed = new Float32Array(cols * rows).map(() => Math.random());
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = Boolean(e?.isIntersecting)));
    io.observe(canvas);

    let last = 0;
    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || now - last < 100) return;
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      for (let y = 0; y < rows; y++) {
        const band = 1 - Math.abs(y / (rows - 1) - 0.5) * 2;
        const rowShift = Math.sin(y * 3.1 + t * 2) > 0.8 ? Math.floor(t * 20) % cols : 0;
        for (let x = 0; x < cols; x++) {
          const s = seed[y * cols + ((x + rowShift) % cols)]!;
          const flicker = Math.sin(t * 6 + s * 40) * 0.08;
          const v = s * band + flicker;
          if (v < 0.62) continue;
          const alpha = Math.min(1, (v - 0.62) * 2.2);
          ctx.fillStyle = v > 0.92 ? `rgba(190,255,200,${alpha})` : `rgba(0,255,65,${alpha * 0.55})`;
          ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
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

  return (
    <div
      className="relative h-10 border-y border-line/40 bg-[linear-gradient(90deg,transparent,rgba(0,255,65,0.06),transparent)] md:h-[72px]"
      aria-hidden
    >
      <canvas ref={ref} className="absolute inset-0 hidden size-full opacity-60 md:block" />
    </div>
  );
}
