"use client";

import Link from "@/shims/next-link";
import { usePathname } from "@/shims/next-navigation";
import { cn } from "@repo/ui";

export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn("relative text-[15px] transition-colors", active ? "text-accent" : "text-muted hover:text-text")}
          >
            {l.label}
            {active && <span className="absolute -bottom-[22px] left-0 right-0 h-px bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}
