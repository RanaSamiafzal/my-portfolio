import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { loadServices } from "@/lib/content";
import { ServicesForm } from "./services-form";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/admin/login");
  const services = await loadServices();

  return (
    <div className="container-x max-w-3xl pb-24 pt-10">
      <SectionLabel index="CMS">Content</SectionLabel>
      <h1 className="mt-4 font-medium text-4xl tracking-tight">Services</h1>
      <p className="mt-2 text-sm text-muted">Home-page hire cards — plain text fields.</p>
      <ServicesForm services={services} />
    </div>
  );
}
