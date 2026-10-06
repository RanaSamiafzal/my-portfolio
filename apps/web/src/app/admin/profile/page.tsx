import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadSettings } from "@/lib/content";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const { profile, ticker } = await loadSettings();

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-muted">Simple fields — no JSON required.</p>
      <ProfileForm profile={profile} ticker={ticker} />
    </div>
  );
}
