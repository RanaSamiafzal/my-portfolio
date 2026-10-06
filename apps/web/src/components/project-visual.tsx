import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@repo/ui";

/** Fake browser window used to frame screenshots and product mockups. */
export function BrowserFrame({ url, children, className, mock }: { url: string; children: ReactNode; className?: string; mock?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line-strong bg-[#0d0d16] shadow-2xl shadow-black/60", className)}>
      <div className="flex items-center gap-3 border-b border-line bg-white/[0.03] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="mx-auto max-w-[70%] truncate rounded-md bg-white/5 px-3 py-0.5 font-mono text-[10px] text-muted-soft">{url}</span>
        <span className="w-10 text-right font-mono text-[9px] uppercase tracking-wider text-muted-soft">{mock ? "Mockup" : ""}</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

const bar = (w: string, cls = "bg-white/10") => <span className={cn("block h-2 rounded-full", cls)} style={{ width: w }} />;

function BrandlyMock() {
  const matches = [
    { name: "Ayesha K.", niche: "Beauty · 182K", score: 94, hue: "from-violet to-indigo" },
    { name: "Hamza R.", niche: "Tech · 96K", score: 88, hue: "from-indigo to-cyan" },
    { name: "Sara M.", niche: "Lifestyle · 240K", score: 81, hue: "from-pink to-violet" },
    { name: "Bilal A.", niche: "Fitness · 64K", score: 73, hue: "from-cyan to-indigo" },
  ];
  return (
    <div className="grid grid-cols-[92px_1fr] text-[10px] sm:grid-cols-[120px_1fr]">
      <aside className="space-y-2 border-r border-line p-3">
        <p className="mb-3 font-semibold text-white">Brandly</p>
        {["Dashboard", "Campaigns", "AI Matches", "Messages", "Escrow"].map((l, i) => (
          <p key={l} className={cn("rounded-md px-2 py-1", i === 2 ? "bg-violet/20 text-white" : "text-muted-soft")}>
            {l}
          </p>
        ))}
      </aside>
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-white">Summer Glow campaign</p>
            <p className="text-muted-soft">Top matches · ranked by AI engine</p>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-300">Escrow funded</span>
        </div>
        {matches.map((m) => (
          <div key={m.name} className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-2.5">
            <span className={cn("size-7 shrink-0 rounded-full bg-gradient-to-br", m.hue)} />
            <div className="min-w-0 flex-1">
              <p className="text-white">{m.name}</p>
              <p className="text-muted-soft">{m.niche}</p>
            </div>
            <div className="w-20 sm:w-28">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={cn("h-full rounded-full bg-gradient-to-r", m.hue)} style={{ width: `${m.score}%` }} />
              </div>
            </div>
            <span className="w-8 text-right font-mono text-white">{m.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentMock() {
  return (
    <div className="relative h-full min-h-[260px] p-5 text-[10px]">
      {/* host website skeleton */}
      <div className="space-y-2 opacity-60">
        <div className="flex items-center justify-between">
          {bar("70px", "bg-white/20")}
          <div className="flex gap-2">{bar("30px")}{bar("30px")}{bar("30px")}</div>
        </div>
        <div className="pt-6">{bar("55%", "bg-white/15 h-4")}</div>
        {bar("40%", "bg-white/15 h-4")}
        <div className="pt-2 space-y-1.5">{bar("60%")}{bar("50%")}</div>
        <div className="grid grid-cols-3 gap-2 pt-4">
          {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-white/5" />)}
        </div>
      </div>
      {/* chat widget */}
      <div className="absolute bottom-4 right-4 w-[62%] max-w-[260px] overflow-hidden rounded-2xl border border-line-strong bg-[#12121c] shadow-2xl shadow-violet/20">
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet to-indigo px-3 py-2 text-white">
          <span className="size-2 rounded-full bg-emerald-300" /> AIDE agent
        </div>
        <div className="space-y-2 p-3">
          <p className="w-fit max-w-[85%] rounded-xl rounded-tl-sm bg-white/10 px-2.5 py-1.5 text-muted">Hi! How can I help with your order today?</p>
          <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-tr-sm bg-violet/40 px-2.5 py-1.5 text-white">Change my delivery to Friday</p>
          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-2 text-amber-100">
            Confirm action: <span className="font-mono">reschedule_delivery(Fri)</span>
            <div className="mt-1.5 flex gap-1.5">
              <span className="rounded-md bg-white px-2 py-0.5 text-black">Confirm</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5">Cancel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpendwiseMock() {
  const bars = [38, 62, 45, 80, 56, 92, 70, 48, 66, 84, 58, 74];
  return (
    <div className="space-y-3 p-4 text-[10px]">
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Balance", "$4,820", "text-white"],
          ["Spent", "$1,236", "text-pink"],
          ["Subscriptions", "$84/mo", "text-cyan"],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border border-line bg-white/[0.03] p-2.5">
            <p className="text-muted-soft">{l}</p>
            <p className={cn("mt-1 text-sm font-semibold", c)}>{v}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1.5fr_1fr] gap-2">
        <div className="rounded-xl border border-line bg-white/[0.03] p-3">
          <p className="mb-2 text-muted-soft">Monthly spending</p>
          <div className="flex h-24 items-end gap-1">
            {bars.map((h, i) => (
              <span key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-violet/40 to-cyan/80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-violet/30 bg-violet/10 p-3">
          <p className="mb-1.5 text-accent">✦ AI advisor</p>
          <p className="leading-relaxed text-muted">
            Dining out is up 32% this month. Cancelling 2 unused subscriptions saves <span className="text-white">$27/mo</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function WeddingMock() {
  return (
    <div className="relative grid min-h-[240px] place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,#3f3a2e,#14120e_70%)] p-6 text-center">
      <div>
        <p className="font-serif text-2xl italic text-[#f3e9d2] sm:text-3xl">The Wedding Poets</p>
        <p className="mt-2 text-[10px] tracking-[0.3em] text-[#c9b98f]">CINEMATIC WEDDING FILMS</p>
        <div className="mx-auto mt-5 grid max-w-[260px] grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-md bg-gradient-to-b from-[#6b5f45] to-[#2a251b]" />
          ))}
        </div>
        <span className="mt-4 inline-block rounded-full border border-[#c9b98f]/50 px-3 py-1 text-[10px] text-[#f3e9d2]">Book a consultation</span>
      </div>
    </div>
  );
}

function PortfolioMock() {
  return (
    <div className="relative grid min-h-[240px] place-items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.45),transparent_55%)]" />
      <div className="relative size-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,#c4b5fd,#7c3aed_45%,#0e7490_85%)] shadow-[0_0_80px_rgba(139,92,246,0.6)]" />
      <div className="absolute size-48 rotate-[65deg] rounded-full border border-violet/40" style={{ transform: "rotateX(70deg)" }} />
    </div>
  );
}

export function ProjectVisual({
  slug,
  className,
  image,
  imageUrl,
}: {
  slug: string;
  className?: string;
  image?: string;
  imageUrl?: string;
}) {
  if (image) {
    const remote = image.startsWith("http");
    return (
      <BrowserFrame url={imageUrl ?? slug} className={className}>
        <div className="relative aspect-[16/10] bg-black">
          <Image
            src={image}
            alt={`${slug} screenshot`}
            fill
            className="object-cover object-top"
            sizes="(min-width: 1024px) 560px, 100vw"
            unoptimized={remote}
          />
        </div>
      </BrowserFrame>
    );
  }
  switch (slug) {
    case "spendwise":
      return (
        <BrowserFrame url="spendwise · dashboard" mock className={className}>
          <SpendwiseMock />
        </BrowserFrame>
      );
    case "the-wedding-poets":
      return (
        <BrowserFrame url="the wedding poets · home" mock className={className}>
          <WeddingMock />
        </BrowserFrame>
      );
    default:
      return (
        <BrowserFrame url="ranasami · portfolio" mock className={className}>
          <PortfolioMock />
        </BrowserFrame>
      );
  }
}

/** Illustrative product-UI view for case studies, shown alongside the real screenshot. */
export function ProjectInsideVisual({ slug, className }: { slug: string; className?: string }) {
  if (slug === "brandly")
    return (
      <BrowserFrame url="brandly · campaigns / summer-glow / matches" mock className={className}>
        <BrandlyMock />
      </BrowserFrame>
    );
  if (slug === "aide")
    return (
      <BrowserFrame url="client site · embedded AIDE widget" mock className={className}>
        <AgentMock />
      </BrowserFrame>
    );
  if (slug === "spendwise")
    return (
      <BrowserFrame url="spendwise · dashboard" mock className={className}>
        <SpendwiseMock />
      </BrowserFrame>
    );
  return null;
}
