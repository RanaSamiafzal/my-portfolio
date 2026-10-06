export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer items-center justify-between gap-6 text-lg text-text transition-colors hover:text-accent md:text-xl">
            {item.q}
            <span className="faq-icon font-mono text-2xl text-accent transition-transform duration-300" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 max-w-[68ch] leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
