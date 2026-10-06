import type { Metadata } from "next";
import Image from "next/image";
import { Card, SectionLabel, Tag } from "@repo/ui";
import { Reveal } from "@/components/reveal";
import { loadExperience, loadProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "About Rana Muhammad Sami — Full Stack Engineer based in Lahore.",
};

export const revalidate = 3600;

export default async function AboutPage() {
  const [profile, experience] = await Promise.all([loadProfile(), loadExperience()]);
  const glance = [
    ["Full name", profile.name],
    ["Based", profile.location],
    ["Role", profile.role],
    ["Education", `${profile.education.degree} — ${profile.education.school}`],
    ["Timezone", profile.timezone],
    ["Phone", profile.phone],
  ] as const;

  return (
    <div className="container-x pb-24 pt-16 md:pt-24">
      <SectionLabel index="03">About</SectionLabel>
      <h1 className="h-display mt-5 max-w-[18ch] text-[clamp(2.4rem,6vw,4.8rem)]">
        Engineer from Lahore. Detail-obsessed by trade.
      </h1>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          {profile.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
        <Card className="group h-fit overflow-hidden">
          <div className="thumb-glitch relative aspect-square">
            <Image
              src={profile.portrait}
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <p className="absolute bottom-4 left-5 font-mono text-[11px] tracking-[0.2em] text-accent">AT A GLANCE</p>
          </div>
          <dl className="divide-y divide-line">
            {glance.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-5 py-3 text-sm">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-soft">{k}</dt>
                <dd className="text-text">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <SectionLabel index="03.1" className="mt-24">
        Experience
      </SectionLabel>
      <div className="mt-8 space-y-4">
        {experience.map((r, i) => (
          <Reveal key={`${r.company}-${r.title}`} delay={i * 60}>
            <Card className="p-6 md:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl tracking-tight">
                  {r.title} <span className="text-accent">· {r.company}</span>
                </h2>
                <p className="font-mono text-xs text-muted-soft">{r.period}</p>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted-soft">{r.location}</p>
              <ul className="mt-5 space-y-2 text-muted">
                {r.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span className="text-accent">→</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {r.stack.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
