"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import { HeroPoster } from "@/components/hero-poster";
import { prefersLiteExperience } from "@/lib/media";

const ScanPortrait = dynamic(
  () => import("@/components/scan-portrait").then((m) => m.ScanPortrait),
  { ssr: false, loading: () => null },
);

const Terminal = dynamic(() => import("@/components/terminal").then((m) => m.Terminal), {
  ssr: false,
  loading: () => (
    <div className="min-h-[220px] rounded-2xl border border-line bg-black/40 p-4 font-mono text-xs text-muted-soft md:min-h-[280px]">
      Loading shell…
    </div>
  ),
});

const AsciiField = dynamic(() => import("@/components/ascii-field").then((m) => m.AsciiField), {
  ssr: false,
  loading: () => null,
});

/** Live WebGL scan everywhere; CSS poster until the Three.js chunk is ready. */
export function HeroPortrait(props: { src: string; mask: string; matte: string; className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <HeroPoster src={props.src} matte={props.matte} className={props.className} />;
  return <ScanPortrait {...props} />;
}

export function HomeTerminal(props: ComponentProps<typeof Terminal>) {
  return <Terminal {...props} />;
}

/** Skip loading the ASCII canvas chunk on phones. */
export function HomeAscii(props: { className?: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!prefersLiteExperience()) setOk(true);
  }, []);
  if (!ok) return null;
  return <AsciiField {...props} />;
}
