import Link from "next/link";
import type { Project } from "@repo/content";
import { Tag, cn } from "@repo/ui";
import { ProjectVisual } from "./project-visual";

export function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        status === "Live" && "border-accent/40 text-accent",
        status === "In progress" && "border-amber-300/40 text-amber-200",
        status === "Shipped" && "border-line-strong text-muted",
      )}
    >
      {status === "Live" && <span className="size-1.5 rounded-full bg-accent shadow-[0_0_6px_#00ff41]" />}
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

/** Ruben-style project entry with a duotone screenshot that glitches into colour on hover. */
export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  return (
    <article className="card group grid gap-6 p-5 md:grid-cols-[1.15fr_1fr] md:p-7">
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3">
          {project.featured && <span className="font-mono text-xs text-accent">[!]</span>}
          {index !== undefined && <span className="font-mono text-xs text-muted-soft">{String(index + 1).padStart(2, "0")}</span>}
          <StatusBadge status={project.status} />
        </div>
        <h3 className="mt-4 font-display text-[28px] leading-tight tracking-tight text-text transition-colors group-hover:text-accent">
          {project.caseStudy ? (
            <Link href={`/work/${project.slug}`} className="relative z-10 hover:text-accent">
              {project.name}
            </Link>
          ) : (
            project.name
          )}
        </h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-soft">
          {project.context} · {project.period}
        </p>
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
      <div className="thumb-glitch self-center rounded-xl">
        <ProjectVisual slug={project.slug} image={project.image} imageUrl={project.imageUrl} />
      </div>
    </article>
  );
}
