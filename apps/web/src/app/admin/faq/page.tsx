import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadFaq } from "@/lib/content";
import { FaqForm } from "./faq-form";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const faq = await loadFaq();

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">FAQ</h1>
      <p className="mt-2 text-sm text-muted">Question + answer fields. Add or remove freely.</p>
      <FaqForm items={faq} />
    </div>
  );
}
