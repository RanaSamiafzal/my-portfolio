"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** Cycles through words, decoding each one from random glyphs (left to right). */
export function ScrambleText({ words, hold = 2200 }: { words: readonly string[]; hold?: number }) {
  const [text, setText] = useState(words[0] ?? "");

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      return;
    }
    let index = 0;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    const decode = (target: string) => {
      const start = performance.now();
      const duration = 700;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const settled = Math.floor(p * target.length);
        let out = target.slice(0, settled);
        for (let i = settled; i < target.length; i++) {
          out += target[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setText(out);
        if (p < 1) raf = requestAnimationFrame(step);
        else timer = setTimeout(next, hold);
      };
      raf = requestAnimationFrame(step);
    };
    const next = () => {
      index = (index + 1) % words.length;
      decode(words[index] ?? "");
    };
    timer = setTimeout(next, hold);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [words, hold]);

  return <span className="text-accent">{text}</span>;
}
