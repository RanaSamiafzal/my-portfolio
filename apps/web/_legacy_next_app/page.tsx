import Link from "next/link";
import { preload } from "react-dom";
import { SectionLabel, StatusDot, Tag } from "@repo/ui";
import { CountUp } from "@/components/count-up";
import { Faq } from "@/components/faq";
import { GlitchDivider } from "@/components/glitch-divider";
import { HeroSpotlight } from "@/components/hero-spotlight";
import { HomeAscii, HeroPortrait, HomeTerminal } from "@/components/home-heavy";
import { LiveCode } from "@/components/live-code";
import { PixelIcon, type PixelIconName } from "@/components/pixel-icon";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { ScrambleText } from "@/components/scramble-text";
import { StackUsage } from "@/components/stack-usage";
import {
  loadExperience,
  loadFaq,
  loadMarquee,
  loadProjects,
  loadSettings,
  loadStackUsage,
} from "@/lib/content";
import { getGitHubStats } from "@/lib/github";

export const revalidate = 3600;

const serviceIcons: PixelIconName[] = ["stack", "bolt", "shield"];
const serviceProof = ["/work/brandly", "/work/aide", "/work/brandly"];

export default async function HomePage() {
  const [gh, projects, settings, experience, marqueeStack, usage, faq] = await Promise.all([
    getGitHubStats(),
    loadProjects(),
    loadSettings(),
    loadExperience(),
    loadMarquee(),
    loadStackUsage(),
    loadFaq(),
  ]);
  const { profile, services, hero } = settings;

  preload(hero.desk, { as: "image", fetchPriority: "high" });
  preload(hero.matte, { as: "image", fetchPriority: "high" });
  preload(hero.mask, { as: "image" });

  const featured = projects.filter((p) => p.featured);
  const live = projects.filter((p) => p.status === "Live");
  const cases = projects.filter((p) => p.caseStudy);

  const stats: { value: number; suffix?: string; label: string; icon: PixelIconName; mobile?: boolean }[] = [
    { value: gh.publicRepos, label: "public repositories", icon: "code", mobile: true },
    { value: live.length, label: "products live in production", icon: "rocket", mobile: true },
    { value: 3, label: "AI-powered products built", icon: "bolt", mobile: true },
    { value: usage.length, label: "technologies shipped to prod", icon: "users", mobile: true },
    { value: new Date().getFullYear() - 2022, suffix: "+", label: "years delivering to deadlines", icon: "clock", mobile: true },
    { value: cases.length, label: "documented case studies", icon: "chart", mobile: true },
    { value: 5, label: "packages in the Brandly monorepo", icon: "stack" },
    { value: profile.courses.length, label: "courses & certifications", icon: "shield" },
  ];

  return (
    <>
      {/* ═════════ HERO ═════════ */}
      <section className="relative isolate overflow-x-clip">
        <HeroSpotlight />
        {/* Desktop: holographic screen overlaid on the desk */}
        <div className="absolute left-[47%] top-[57%] z-10 hidden w-[340px] lg:block">
          <LiveCode variant="holo" emitKeys className="w-full" />
        </div>
        <div className="container-x grid py-5 sm:py-10 lg:min-h-[calc(100dvh-6.5rem)] lg:items-center lg:py-0">
          <div className="relative max-w-[640px] [text-shadow:0_2px_28px_rgba(0,0,0,0.95)]">
            <p className="text-base text-muted sm:text-lg md:text-xl">
              Hello, I&apos;m <span className="text-accent">{profile.name}</span>
            </p>
            <h1 className="h-display mt-3 text-[clamp(2.15rem,8.2vw,4.6rem)] text-text sm:mt-5 sm:text-[clamp(2.6rem,5.2vw,4.6rem)]">
              {profile.headline}
            </h1>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted sm:mt-6 sm:text-xs md:text-[13px]">
              I build <ScrambleText words={profile.rotating} />
            </p>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted sm:mt-6 sm:text-[17px]">{profile.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-9 sm:gap-3">
              <Link href="/contact" className="btn-cream">
                Book a project
              </Link>
              <Link href="/work" className="btn-outline">
                See my work
              </Link>
            </div>
            <a
              href="/llms.txt"
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-line-strong bg-black/40 px-3 py-1.5 font-mono text-[11px] text-accent transition-colors hover:border-accent sm:mt-6"
            >
              <StatusDot /> AGENT-READY · read /llms.txt ↗
            </a>
          </div>
        </div>

        {/* Portrait: live scan on all viewports. Mobile cyber-code is punched out by the matte. */}
        <div className="relative -mt-6 w-full overflow-visible pb-2 sm:-mt-2 lg:absolute lg:inset-y-0 lg:right-0 lg:-z-10 lg:mt-0 lg:w-[56%] lg:pb-0">
          <div className="relative mx-auto h-[min(78vw,390px)] w-full overflow-hidden sm:h-[480px] lg:absolute lg:inset-0 lg:h-auto lg:overflow-visible">
            {/* Mobile: code only around the silhouette — matte punches a hole so it never covers the face */}
            <div
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden lg:hidden"
              style={{
                WebkitMaskImage: `linear-gradient(#fff,#fff), url(${hero.matte})`,
                WebkitMaskSize: "100% 100%, cover",
                WebkitMaskPosition: "center, 40% 22%",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskComposite: "destination-out",
                maskImage: `linear-gradient(#fff,#fff), url(${hero.matte})`,
                maskSize: "100% 100%, cover",
                maskPosition: "center, 40% 22%",
                maskRepeat: "no-repeat",
                maskComposite: "exclude",
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(0,255,65,0.12),transparent_55%)]" />
              <LiveCode
                variant="ghost"
                emitKeys
                className="absolute left-1 top-3 w-[46%] text-[9px] leading-[1.4] opacity-90 sm:text-[10px]"
              />
              <LiveCode
                variant="ghost"
                offset={1}
                className="absolute bottom-2 left-2 w-[52%] text-[9px] leading-[1.4] opacity-70 sm:text-[10px]"
              />
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)",
                }}
              />
            </div>
            <HeroPortrait
              src={hero.desk}
              mask={hero.mask}
              matte={hero.matte}
              className="absolute inset-0 z-[1] h-full w-full"
            />
          </div>
        </div>
      </section>

      <GlitchDivider />

      {/* ═════════ 01 HIRE ME ═════════ */}
      <section className="section-y">
        <div className="container-x">
          <Reveal className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <SectionLabel index="01">Hire me</SectionLabel>
              <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)]">Hire me for</h2>
            </div>
            <div>
              <p className="max-w-[46ch] leading-relaxed text-muted">
                End-to-end ownership, production habits, no hand-holding. Every offer below is something I&apos;ve already shipped.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag className="text-accent">Lahore · remote worldwide</Tag>
                <Tag className="text-accent">EU · UK · US overlap</Tag>
                <Tag className="text-accent">Full-time · contract · freelance</Tag>
              </div>
              <Link href="/contact" className="btn-cream mt-6">
                Book a project →
              </Link>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 90}>
                <article className="card group flex h-full flex-col p-7">
                  <div className="flex items-center justify-between">
                    <PixelIcon name={serviceIcons[i]!} />
                    <span className="font-mono text-xs text-muted-soft">{s.id}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl tracking-tight transition-colors group-hover:text-accent">{s.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">{s.body}</p>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                  <Link href={serviceProof[i]!} className="link-mono mt-7">
                    See the proof →
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <GlitchDivider />

      {/* ═════════ 02 PROOF ═════════ */}
      <section className="section-y">
        <div className="container-x">
          <Reveal>
            <SectionLabel index="02">Proof in numbers</SectionLabel>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)]">Shipped, measured.</h2>
          </Reveal>
          <Reveal className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-line sm:mt-12 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`group border-b border-r border-line p-4 transition-colors hover:bg-bg-1 sm:p-6 md:p-7${s.mobile ? "" : " max-lg:hidden"}`}
              >
                <PixelIcon name={s.icon} className="size-3.5 opacity-80 transition-opacity group-hover:opacity-100 sm:size-4" />
                <p className="mt-2.5 font-display text-[1.85rem] leading-none tracking-tight text-text sm:mt-5 sm:text-5xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-1.5 text-[11px] leading-snug text-muted sm:mt-2 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-4 font-mono text-[11px] text-muted-soft">
            Repos live from the GitHub API · top languages: {gh.languages.slice(0, 4).join(" · ")}
          </p>

          {/* Products wall — 3×2 on phones so it stays two rows */}
          <Reveal className="card mt-16 p-5 md:p-8">
            <p className="text-xl text-text md:text-2xl">Products I&apos;ve built and shipped.</p>
            <div className="mt-5 grid grid-cols-3 border-l border-t border-line lg:grid-cols-6">
              {projects
                .filter((p) => p.slug !== "portfolio")
                .map((p) => {
                  const href = p.caseStudy ? `/work/${p.slug}` : (p.links[0]?.href ?? "/work");
                  const external = !p.caseStudy && href.startsWith("http");
                  return (
                    <a
                      key={p.slug}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="group grid aspect-square place-items-center border-b border-r border-line p-2 text-center transition-colors hover:bg-bg-2 sm:aspect-[4/3] sm:p-4"
                    >
                      <span>
                        <span className="block font-display text-[15px] tracking-tight text-muted transition-colors group-hover:text-accent group-hover:[text-shadow:0_0_18px_rgba(0,255,65,0.6)] sm:text-xl">
                          {p.name}
                        </span>
                        <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-muted-soft sm:text-[10px]">
                          {p.status}
                        </span>
                      </span>
                    </a>
                  );
                })}
            </div>
            <Link href="/work" className="btn-outline mt-5 inline-flex w-full justify-center sm:w-auto">
              See all projects →
            </Link>
          </Reveal>
        </div>
      </section>

      <GlitchDivider />

      {/* ═════════ 03 STACK ═════════ */}
      <section className="section-y">
        <div className="container-x">
          <Reveal className="grid gap-4 md:grid-cols-2 md:items-end md:gap-6">
            <div>
              <SectionLabel index="03">Stack</SectionLabel>
              <h2 className="h-display mt-4 text-[clamp(2.15rem,5.4vw,4.4rem)] sm:mt-5 sm:text-[clamp(2.4rem,5.4vw,4.4rem)]">
                What I actually ship with.
              </h2>
            </div>
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted sm:text-base">
              Not a logo wall — counted from my real projects. React is in every one of them;{" "}
              {usage
                .filter((u) => u.pct >= 50 && u.name !== "React")
                .map((u) => u.name)
                .join(", ")}{" "}
              power most of the rest.{" "}
              <span className="hidden sm:inline">Hover a row to see where each one is used.</span>
              <span className="sm:hidden">Tap a row to see where it&apos;s used.</span>
            </p>
          </Reveal>
          <Reveal className="mt-8 sm:mt-14">
            <StackUsage rows={usage.slice(0, 12)} total={projects.length} />
          </Reveal>
        </div>
        <div className="relative mt-16 overflow-hidden border-y border-line py-5 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-3 [animation-duration:60s]">
            {[...marqueeStack, ...marqueeStack].map((s, i) => (
              <span key={i} className="rounded-full border border-line-strong px-4 py-1.5 font-mono text-sm text-muted">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 04 WORK ═════════ */}
      <section className="section-y pt-0">
        <div className="container-x">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel index="04">Selected work</SectionLabel>
              <h2 className="h-display mt-5 max-w-[16ch] text-[clamp(2.4rem,5.4vw,4.4rem)]">Products, platforms and systems in production.</h2>
            </div>
            <Link href="/work" className="link-mono">
              All projects ({projects.length}) →
            </Link>
          </Reveal>
          <div className="mt-14 space-y-4">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <GlitchDivider />

      {/* ═════════ 05 SHELL ═════════ */}
      <section className="section-y">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <SectionLabel index="05">Shell</SectionLabel>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)]">Don&apos;t scroll. Type.</h2>
            <p className="mt-6 max-w-[44ch] leading-relaxed text-muted">
              A real shell over my portfolio — a virtual filesystem, tab completion, history, and live network calls. Try{" "}
              <code className="rounded bg-bg-2 px-1.5 py-0.5 font-mono text-accent">neofetch</code>, or send me a brief with{" "}
              <code className="rounded bg-bg-2 px-1.5 py-0.5 font-mono text-accent">hire</code>.
            </p>
            <ul className="mt-6 space-y-2 font-mono text-[12px] text-muted">
              {[
                ["cat projects/brandly/README.md", "read any project from the virtual FS"],
                ["github", "live repos from the GitHub API"],
                ["ping aide", "real latency to my live deployments"],
                ["grep socket", "which projects use a technology"],
                ["hire", "3-step wizard → POST /api/hire"],
              ].map(([c, d]) => (
                <li key={c} className="flex gap-3">
                  <span className="text-accent">❯</span>
                  <span>
                    <span className="text-text">{c}</span> <span className="text-muted-soft">— {d}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-muted-soft">
              Prefer machines? Agents can read <a href="/llms.txt" className="text-accent underline">/llms.txt</a> and send a brief to{" "}
              <code className="font-mono text-accent">POST /api/hire</code>.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <HomeTerminal
              data={{
                name: profile.name,
                role: profile.role,
                location: profile.location,
                timezone: profile.timezone,
                email: profile.email,
                github: profile.socials.github,
                githubUser: profile.githubUser,
                linkedin: profile.socials.linkedin,
                cv: profile.cv,
                about: [...profile.about],
                education: `${profile.education.degree}, ${profile.education.school}`,
                experience: experience.map((e) => ({ period: e.period, title: e.title, company: e.company, points: e.points })),
                projects: projects.map((p) => ({
                  slug: p.slug,
                  name: p.name,
                  tagline: p.tagline,
                  summary: p.summary,
                  status: p.status,
                  period: p.period,
                  context: p.context,
                  stack: p.stack,
                  tech: p.tech,
                  links: p.links,
                  hasCase: Boolean(p.caseStudy),
                })),
                stack: usage,
              }}
            />
          </Reveal>
        </div>
      </section>

      {/* ═════════ 06 EXPERIENCE ═════════ */}
      <section className="section-y border-t border-line">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionLabel index="06">Experience</SectionLabel>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)]">Where I&apos;ve shipped.</h2>
            <Link href="/about" className="link-mono mt-8 inline-block">
              Full timeline →
            </Link>
          </Reveal>
          <div className="divide-y divide-line border-y border-line">
            {experience.map((r, i) => (
              <Reveal key={r.company} delay={i * 70} className="grid gap-2 py-7 sm:grid-cols-[160px_1fr]">
                <p className="font-mono text-xs text-muted-soft">{r.period}</p>
                <div>
                  <p className="text-xl text-text">
                    {r.title} <span className="text-accent">@ {r.company}</span>
                  </p>
                  <p className="mt-2 leading-relaxed text-muted">{r.points[0]}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.stack.slice(0, 4).map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 07 FAQ ═════════ */}
      <section className="section-y border-t border-line">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <SectionLabel index="07">FAQ</SectionLabel>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.4rem)]">What teams usually ask.</h2>
          </Reveal>
          <Reveal delay={80}>
            <Faq items={faq} />
          </Reveal>
        </div>
      </section>

      {/* ═════════ CONTACT CTA ═════════ */}
      <section className="pb-8 sm:pb-16">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden px-4 py-10 text-center sm:px-6 sm:py-16 md:py-28">
              <HomeAscii className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_at_center,transparent_15%,#000_75%)]" />
              <div className="relative">
                <SectionLabel index="08">Contact</SectionLabel>
                <h2 className="h-display mx-auto mt-4 max-w-[18ch] text-[clamp(1.85rem,7vw,4.6rem)] sm:mt-6 sm:text-[clamp(2.4rem,5.4vw,4.6rem)]">
                  Need an engineer who can ship from idea to production?
                </h2>
                <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-muted sm:mt-6 sm:text-base">
                  {profile.availability}. I usually reply within a day.
                </p>
                <div className="mt-6 flex flex-nowrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
                  <Link href="/contact" className="btn-cream shrink-0 !px-3 !py-2 text-[13px] sm:!px-5 sm:!py-2.5 sm:text-base">
                    Start a conversation →
                  </Link>
                  <a
                    href={`mailto:${profile.email}`}
                    className="btn-outline min-w-0 shrink truncate !px-3 !py-2 text-[13px] sm:!px-5 sm:!py-2.5 sm:text-base"
                    title={profile.email}
                  >
                    <span className="sm:hidden">Email me</span>
                    <span className="hidden sm:inline">{profile.email}</span>
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
