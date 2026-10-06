import Link from "next/link";
import { LocalTime } from "./local-time";
import { loadProfile, loadSettings } from "@/lib/content";

export async function SiteFooter() {
  const [profile, settings] = await Promise.all([loadProfile(), loadSettings()]);
  return (
    <footer className="relative z-10 mt-4 border-t border-line sm:mt-8">
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:gap-y-10 sm:py-12 md:grid-cols-[1.4fr_1fr_1fr] md:gap-12 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-display text-2xl tracking-tight">
            ranasami<span className="text-accent">.</span>dev
          </Link>
          <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted md:mt-4">
            Full-stack engineer building real-time, AI-powered web products from Lahore, for teams anywhere.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] text-muted md:mt-5">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_6px_#00ff41]" /> Lahore · <LocalTime /> PKT
          </p>
        </div>
        <div>
          <p className="mono-label mb-3 md:mb-4">Pages</p>
          <ul className="space-y-2 text-sm md:space-y-2.5">
            {settings.navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-accent">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mono-label mb-3 md:mb-4">Connect</p>
          <ul className="space-y-2 text-sm md:space-y-2.5">
            <li><a className="text-muted hover:text-accent" href={profile.socials.github} target="_blank" rel="noreferrer">GitHub ↗</a></li>
            <li><a className="text-muted hover:text-accent" href={profile.socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></li>
            <li><a className="break-all text-muted hover:text-accent" href={`mailto:${profile.email}`}>{profile.email}</a></li>
            <li><a className="text-muted hover:text-accent" href={profile.cv} target="_blank">Download CV ↓</a></li>
            <li><a className="text-muted hover:text-accent" href="/llms.txt">llms.txt</a></li>
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-2 border-t border-line py-5 font-mono text-[11px] text-muted-soft sm:flex-row sm:flex-wrap sm:justify-between sm:gap-3 sm:py-6">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <span>Built with Next.js · Turborepo · Three.js · NextAuth</span>
      </div>
    </footer>
  );
}
