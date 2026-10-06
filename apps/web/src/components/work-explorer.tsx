"use client";

import { useMemo, useState } from "react";
import { projectCategories, type Project, type ProjectCategory } from "@repo/content";
import { Pill } from "@repo/ui";
import { ProjectCard } from "./project-card";

export function WorkExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const [tech, setTech] = useState<string | null>(null);

  const topTech = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const s of p.stack) counts.set(s, (counts.get(s) ?? 0) + 1);
    return [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).map(([s, n]) => ({ s, n }));
  }, [projects]);

  const visible = projects.filter(
    (p) => (filter === "All" || p.categories.includes(filter)) && (!tech || p.stack.includes(tech)),
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Pill active={filter === "All"} onClick={() => setFilter("All")}>
          All <span className="opacity-60">{projects.length}</span>
        </Pill>
        {projectCategories.map((c) => (
          <Pill key={c} active={filter === c} onClick={() => setFilter(c)}>
            {c} <span className="opacity-60">{projects.filter((p) => p.categories.includes(c)).length}</span>
          </Pill>
        ))}
      </div>
      {topTech.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {topTech.map(({ s, n }) => (
            <Pill key={s} active={tech === s} onClick={() => setTech(tech === s ? null : s)} className="py-1 text-[11px]">
              {s} <span className="opacity-60">{n}</span>
            </Pill>
          ))}
          {tech && (
            <button type="button" onClick={() => setTech(null)} className="font-mono text-[11px] text-muted-soft hover:text-accent">
              Clear tech
            </button>
          )}
        </div>
      )}
      <div className="mt-10 space-y-4">
        {visible.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
        {visible.length === 0 && <p className="font-mono text-sm text-muted-soft">No projects match these filters.</p>}
      </div>
    </>
  );
}
