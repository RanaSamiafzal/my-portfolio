import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadMarquee, loadSkills } from "@/lib/content";
import { SkillsForm } from "./skills-form";

export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const [skillGroups, marquee] = await Promise.all([loadSkills(), loadMarquee()]);

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">Skills</h1>
      <p className="mt-2 text-sm text-muted">Group titles, blurbs, and skill lists — no JSON.</p>
      <SkillsForm groups={skillGroups} marquee={marquee} />
    </div>
  );
}
