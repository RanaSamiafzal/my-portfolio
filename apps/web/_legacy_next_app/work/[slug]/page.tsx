import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, SectionLabel, Tag } from "@repo/ui";
import { StatusBadge } from "@/components/project-card";
import { ProjectInsideVisual, ProjectVisual } from "@/components/project-visual";
import { Reveal } from "@/components/reveal";
import { loadProject, loadProjects } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await loadProjects();
  return projects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await loadProject((await params).slug);
  if (!project) return {};
  return { title: `${project.name} — case study`, description: project.summary };
}

export default async function CaseStudyPage({ params }: Props) {
  const slug = (await params).slug;
  const [project, projects] = await Promise.all([loadProject(slug), loadProjects()]);
  if (!project?.caseStudy) notFound();
  const cs = project.caseStudy;
  const withCases = projects.filter((p) => p.caseStudy);
  const next = withCases[(withCases.findIndex((p) => p.slug === project.slug) + 1) % withCases.length]!;

  return (
    <article className="container-x pb-24 pt-16 md:pt-24">
      <Link href="/work" className="font-mono text-xs text-muted-soft hover:text-accent">
        ← ALL WORK
      </Link>
      <div className="mt-10">
        <SectionLabel index="CS">
          {project.context} · {project.period}
        </SectionLabel>
        <h1 className="h-display mt-6 text-[clamp(3rem,8vw,6.5rem)]">{project.name}</h1>
        <p className="mt-4 max-w-[40ch] text-xl text-accent md:text-2xl">{project.tagline}</p>
      </div>

      <div className="relative mt-14">
        <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(0,255,65,0.12),transparent_65%)] blur-2xl" aria-hidden />
        <ProjectVisual slug={project.slug} image={project.image} imageUrl={project.imageUrl} className="relative" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          <p>{project.summary}</p>
          <p>{cs.problem}</p>
        </div>
        <Card className="h-fit p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">Role</dt>
              <dd className="mt-1 text-text">{cs.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">Status</dt>
              <dd className="mt-1.5">
                <StatusBadge status={project.status} />
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">Stack</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </dd>
            </div>
            {project.links.length > 0 && (
              <div>
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-soft">Links</dt>
                <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                  {project.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                      {l.label} ↗
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {ProjectInsideVisual({ slug: project.slug }) && (
        <section className="mt-24 grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <SectionLabel>Inside the product</SectionLabel>
            <h2 className="mt-6 text-3xl font-medium tracking-tight md:text-4xl">What users actually work with</h2>
            <p className="mt-4 leading-relaxed text-muted">
              An illustrative view of the core workflow, with sample data — the screen where the product earns its keep.
            </p>
          </div>
          <ProjectInsideVisual slug={project.slug} />
        </section>
      )}

      <section className="mt-24">
        <SectionLabel index="01">Architecture</SectionLabel>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line">
          {cs.architecture.map((a, i) => (
            <Reveal key={a.name} delay={i * 60} className="grid gap-2 border-line px-6 py-5 sm:grid-cols-[260px_1fr] [&:not(:last-child)]:border-b">
              <code className="font-mono text-sm text-accent">{a.name}</code>
              <p className="text-muted">{a.detail}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <SectionLabel index="02">What I built</SectionLabel>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cs.highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 60}>
              <Card className="h-full p-6">
                <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-xl font-medium tracking-tight">{h.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{h.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <SectionLabel index="03">Decisions</SectionLabel>
          <h2 className="mt-6 text-3xl font-medium tracking-tight">Trade-offs worth explaining.</h2>
        </div>
        <ol className="space-y-5">
          {cs.decisions.map((d, i) => (
            <li key={i} className="flex gap-4 leading-relaxed text-muted">
              <span className="font-mono text-sm text-accent">→</span>
              {d}
            </li>
          ))}
          {cs.next && (
            <li className="flex gap-4 leading-relaxed text-muted">
              <span className="font-mono text-sm text-accent-soft">next</span>
              {cs.next}
            </li>
          )}
        </ol>
      </section>

      <Link
        href={`/work/${next.slug}`}
        className="group mt-28 flex items-end justify-between gap-6 border-t border-line pt-10"
      >
        <div>
          <p className="font-mono text-xs text-muted-soft">NEXT CASE STUDY</p>
          <p className="mt-3 text-[clamp(2rem,5vw,4rem)] font-medium leading-none tracking-tight transition-colors group-hover:text-accent">
            {next.name}
          </p>
        </div>
        <span className="font-mono text-3xl text-accent transition-transform group-hover:translate-x-2">→</span>
      </Link>
    </article>
  );
}
