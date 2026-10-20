import type { Metadata } from "next";
import { Card, SectionLabel, Tag } from "@repo/ui";
import { Reveal } from "@/components/reveal";
import { StackUsage } from "@/components/stack-usage";
import { loadProjects, loadSkills, loadStackUsage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Stack",
  description: "Languages, frameworks, databases and tools — with the projects where each one is used.",
};

export const revalidate = 3600;

export default async function StackPage() {
  const [projects, skillGroups, usage] = await Promise.all([loadProjects(), loadSkills(), loadStackUsage()]);
  const usedIn = (skill: string) =>
    projects.filter((p) => p.stack.some((s) => s.toLowerCase().startsWith(skill.toLowerCase().split(" ")[0]!))).map((p) => p.name);

  return (
    <div className="container-x pb-24 pt-16 md:pt-24">
      <SectionLabel index="02">Stack</SectionLabel>
      <h1 className="h-display mt-5 max-w-[16ch] text-[clamp(2.4rem,6vw,4.8rem)]">
        Tools chosen for the job, not the hype.
      </h1>
      <p className="mt-6 max-w-[60ch] leading-relaxed text-muted">
        Counted from my real projects, not a logo wall. Hover a row to see where each technology is used.
      </p>

      <section className="mt-14">
        <SectionLabel index="02.1">Most-used</SectionLabel>
        <div className="mt-8">
          <StackUsage rows={usage} total={projects.length} />
        </div>
      </section>

      <SectionLabel index="02.2" className="mt-24">
        Full toolbox
      </SectionLabel>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g, i) => (
          <Reveal key={g.id} delay={(i % 3) * 80}>
            <Card className="h-full p-7">
              <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 font-display text-2xl tracking-tight">{g.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{g.blurb}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {g.items.map((item) => {
                  const hits = usedIn(item);
                  return (
                    <Tag key={item} className={hits.length ? "border-accent/30 text-accent" : undefined}>
                      {item}
                      {hits.length > 0 && <span className="ml-1 opacity-60">{hits.length}</span>}
                    </Tag>
                  );
                })}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
