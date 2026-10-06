import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadSettings } from "@/lib/content";
import { ThemeForm } from "./theme-form";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const { theme, hero } = await loadSettings();

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">Theme & hero</h1>
      <p className="mt-2 text-sm text-muted">Upload images or paste paths/URLs. Colors apply site-wide.</p>
      <ThemeForm theme={theme} hero={hero} />
    </div>
  );
}
