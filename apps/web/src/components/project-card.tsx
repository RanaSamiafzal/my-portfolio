import Link from "@/shims/next-link";
import type { Project } from "@repo/content";
import { Tag, cn } from "@repo/ui";
import { ProjectVisual } from "./project-visual";

export function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        status === "Live" && "border-accent/40 text-accent",
        status === "In progress" && "border-amber-300/40 text-amber-300",
        status === "Shipped" && "border-line-strong text-muted",
      )}
    >
      {status === "Live" && <span className="size-1.5 rounded-full bg-accent" />}
      {status}
    </span>
  );
}

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2">
      {project.caseStudy && (
        <Link href={`/work/${project.slug}`} className="link-mono">
          Case study →
        </Link>
      )}
      {project.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="font-mono text-xs uppercase tracking-[0.12em] text-muted hover:text-accent">
          {l.label === "Live" ? "Visit" : l.label} ↗
        </a>
      ))}
    </div>
  );
}

/** Image-led editorial project entry, with an optional homepage lead feature. */
export function ProjectCard({ project, index, lead = false }: { project: Project; index?: number; lead?: boolean }) {
  const visualHref = project.caseStudy ? `/work/${project.slug}` : project.links[0]?.href;
  const external = visualHref?.startsWith("http");
  const visual = <ProjectVisual slug={project.slug} image={project.image} imageUrl={project.imageUrl} />;
  return (
    <article className={cn("project-entry group", lead && "project-entry-lead")}>
      <div className="project-entry-copy flex flex-col">
        <div className="flex flex-wrap items-center gap-3">
          {project.featured && <span className="project-feature-label">{lead && project.caseStudy ? "Featured case study" : "Selected project"}</span>}
          {index !== undefined && <span className="font-mono text-xs text-muted-soft">{String(index + 1).padStart(2, "0")}</span>}
          <StatusBadge status={project.status} />
        </div>
        <h3 className="project-title mt-4 font-display text-3xl leading-tight tracking-tight text-text transition-colors group-hover:text-accent">
          {project.caseStudy ? (
            <Link href={`/work/${project.slug}`} className="relative z-10 hover:text-accent">
              {project.name}<span className="project-title-arrow" aria-hidden="true">↗</span>
            </Link>
          ) : (
            project.name
          )}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-soft">
          {project.context} · {project.period}
        </p>
        {lead && <p className="project-deck">{project.tagline}</p>}
        <p className="mt-4 flex-1 leading-relaxed text-muted">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {project.stack.length > 6 && <Tag>+{project.stack.length - 6}</Tag>}
        </div>
        <div className="mt-6">
          <ProjectLinks project={project} />
        </div>
      </div>
      <div className="project-entry-visual thumb-glitch">
        {visualHref ? <Link href={visualHref} className="project-image-link" target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} aria-label={project.caseStudy ? `Read ${project.name} case study` : `Visit ${project.name}`}>
          {visual}
          <span className="project-image-invite" aria-hidden="true">{project.caseStudy ? "View case study" : "Visit project"}<span>↗</span></span>
        </Link> : visual}
      </div>
    </article>
  );
}
