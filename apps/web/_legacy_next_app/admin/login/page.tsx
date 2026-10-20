import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth } from "@/auth";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.isAdmin) redirect("/admin");

  return (
    <div className="container-x flex min-h-[70dvh] items-center justify-center pb-24 pt-16">
      <div className="w-full max-w-md">
        <SectionLabel index="AD">Admin</SectionLabel>
        <h1 className="mt-5 font-medium text-4xl tracking-tight">Sign in</h1>
        <p className="mt-3 text-muted">Email + password for the seeded admin account.</p>
        <AdminLoginForm defaultEmail="" />
      </div>
    </div>
  );
}
