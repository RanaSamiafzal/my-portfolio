import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadExperience } from "@/lib/content";
import { ExperienceForm } from "./experience-form";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const experience = await loadExperience();

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">Experience</h1>
      <p className="mt-2 text-sm text-muted">Add or edit roles with plain text fields.</p>
      <ExperienceForm roles={experience} />
    </div>
  );
}
