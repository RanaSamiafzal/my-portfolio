"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import "locomotive-scroll/locomotive-scroll.css";
import { prefersLiteExperience } from "@/lib/media";

type LocomotiveInstance = {
  destroy: () => void;
  lenisInstance?: { resize: () => void } | null;
};

/**
 * Site-wide Locomotive Scroll (Lenis) smooth scrolling.
 * Desktop only — disabled on mobile/touch (native scroll is faster).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const scrollRef = useRef<LocomotiveInstance | null>(null);

  useEffect(() => {
    if (prefersLiteExperience()) return;

    let cancelled = false;

    void (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      if (cancelled) return;

      scrollRef.current = new LocomotiveScroll({
        lenisOptions: {
          lerp: 0.09,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        },
      });
    })();

    return () => {
      cancelled = true;
      scrollRef.current?.destroy();
      scrollRef.current = null;
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      scrollRef.current?.lenisInstance?.resize();
    }, 80);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
