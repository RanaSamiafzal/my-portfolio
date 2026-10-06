export function Ticker({ items: ticker }: { items: string[] }) {
  const items = [...ticker, ...ticker];
  return (
    <div className="relative z-50 overflow-hidden border-b border-line bg-black" aria-hidden>
      <div className="flex w-max animate-marquee gap-6 whitespace-nowrap py-1.5 font-mono text-[10px] tracking-[0.18em] text-accent motion-reduce:animate-none sm:text-[11px]">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-6">
            {item}
            <span className="text-accent/50">+</span>
          </span>
        ))}
      </div>
    </div>
  );
}
