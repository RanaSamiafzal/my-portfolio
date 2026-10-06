import { redirect } from "next/navigation";
import type { Project } from "@repo/content";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadProject } from "@/lib/content";
import { ProjectForm } from "./project-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const empty: Project = {
  slug: "",
  name: "",
  tagline: "",
  summary: "",
  period: "",
  context: "",
  status: "Live",
  featured: false,
  categories: ["Full-stack"],
  tech: [],
  stack: [],
  links: [],
};

export default async function AdminProjectEditPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");

  const slug = (await params).slug;
  const isNew = slug === "new";
  const project = isNew ? empty : (await loadProject(slug)) ?? empty;

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Projects</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">{isNew ? "New project" : `Edit ${project.name}`}</h1>
      <p className="mt-2 text-sm text-muted">Plain fields for everything except case-study structure.</p>
      <ProjectForm project={project} isNew={isNew} />
    </div>
  );
}
