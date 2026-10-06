import Link from "next/link";
import { auth } from "@/auth";
import { adminSignOut } from "./actions";

const links = [
  { href: "/admin", label: "Inbox" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/theme", label: "Theme" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Login page lives under /admin/login — allow it without the shell.
  // Nested layouts still run; login page handles its own gate.
  if (!session?.user?.isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh">
      <div className="border-b border-line bg-black/60">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-wrap items-center gap-1">
            <Link href="/admin" className="mr-3 font-display text-lg tracking-tight">
              Admin<span className="text-accent">.</span>
            </Link>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:bg-white/5 hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-[11px] text-muted-soft hover:text-accent">
              View site ↗
            </Link>
            <form action={adminSignOut}>
              <button className="font-mono text-[11px] text-muted-soft hover:text-accent">Sign out</button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
