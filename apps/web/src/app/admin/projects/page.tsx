import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, SectionLabel, Tag } from "@repo/ui";
import { auth } from "@/auth";
import { deleteProjectAction } from "../cms-actions";
import { loadProjects } from "@/lib/content";

export const metadata = { title: "Projects", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const projects = await loadProjects();

  return (
    <div className="container-x pb-24 pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel index="CMS">Content</SectionLabel>
          <h1 className="mt-4 font-medium text-4xl tracking-tight">Projects</h1>
          <p className="mt-2 font-mono text-xs text-muted-soft">{projects.length} projects · edits reflect across home, work, stack, sitemap</p>
        </div>
        <Link href="/admin/projects/new" className="btn-cream">
          Add project
        </Link>
      </div>

      <div className="mt-10 space-y-3">
        {projects.map((p) => (
          <Card key={p.slug} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-lg text-text">
                {p.featured && <span className="mr-2 text-accent">★</span>}
                {p.name}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-soft">
                /{p.slug} · {p.status} · {p.period}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.categories.map((c) => (
                  <Tag key={c}>{c}</Tag>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <Link href={`/admin/projects/${p.slug}`} className="text-accent hover:underline">
                Edit
              </Link>
              <form action={deleteProjectAction.bind(null, p.slug)}>
                <button className="text-muted hover:text-red-400">Delete</button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
