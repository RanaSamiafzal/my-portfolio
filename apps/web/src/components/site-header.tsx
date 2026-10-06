import Link from "next/link";
import { FileIcon, GitHubIcon, LinkedInIcon } from "./icons";
import { MenuOverlay } from "./menu-overlay";
import { NavLinks } from "./nav-links";
import { loadProfile, loadSettings } from "@/lib/content";

export async function SiteHeader() {
  const [settings, profile] = await Promise.all([loadSettings(), loadProfile()]);
  const links = settings.navLinks.filter((l) => l.href !== "/");
  const menuLinks = settings.navLinks;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-black/75 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl tracking-tight text-text md:text-[22px]">
          ranasami<span className="text-accent">.</span>dev
        </Link>
        <NavLinks links={links.map((l) => ({ href: l.href, label: l.label }))} />
        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 text-muted lg:flex">
            <a href={profile.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid size-9 place-items-center rounded-lg transition-colors hover:text-accent">
              <GitHubIcon className="size-4" />
            </a>
            <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid size-9 place-items-center rounded-lg transition-colors hover:text-accent">
              <LinkedInIcon className="size-4" />
            </a>
            <a href={profile.cv} target="_blank" aria-label="Download CV" className="grid size-9 place-items-center rounded-lg transition-colors hover:text-accent">
              <FileIcon className="size-4" />
            </a>
          </div>
          <MenuOverlay profile={profile} links={menuLinks} />
        </div>
      </div>
    </header>
  );
}
