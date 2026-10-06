import type { Metadata } from "next";
import { SectionLabel } from "@repo/ui";
import { WorkExplorer } from "@/components/work-explorer";
import { loadProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected full-stack projects: AI SaaS platforms, real-time apps and client builds.",
};

export const revalidate = 3600;

export default async function WorkPage() {
  const projects = await loadProjects();
  return (
    <section className="container-x pb-24 pt-16 md:pt-24">
      <SectionLabel index="01">Selected work</SectionLabel>
      <h1 className="mt-5 max-w-[18ch] h-display text-[clamp(2.4rem,6vw,4.8rem)] leading-[1.02] tracking-tight">
        Products, platforms and interfaces I&apos;ve shipped.
      </h1>
      <p className="mb-12 mt-6 max-w-[60ch] leading-relaxed text-muted">
        A curated record — not every repository, only the work that shows how I build: AI-powered SaaS, real-time systems, client
        websites and the engineering decisions behind them.
      </p>
      <WorkExplorer projects={projects} />
    </section>
  );
}
