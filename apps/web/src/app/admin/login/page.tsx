import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SectionLabel } from "@repo/ui";
import { auth, hasSeededAdmin } from "@/auth";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.isAdmin) redirect("/admin");

  const ready = await hasSeededAdmin();

  return (
    <div className="container-x flex min-h-[70dvh] items-center justify-center pb-24 pt-16">
      <div className="w-full max-w-md">
        <SectionLabel index="AD">Admin</SectionLabel>
        <h1 className="mt-5 font-medium text-4xl tracking-tight">Sign in</h1>
        <p className="mt-3 text-muted">Email + password from the seeded admin in the database.</p>

        {!ready ? (
          <div className="mt-10 space-y-3 font-mono text-sm text-muted-soft">
            <p>No admin in the database yet. From the repo root run:</p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-black/40 p-4 text-accent">{`npm run db:migrate
npm run db:seed:admin`}</pre>
            <p>
              Edit credentials in <code className="text-accent">packages/db/seeds/admin.json</code>, then re-seed.
            </p>
          </div>
        ) : (
          <AdminLoginForm defaultEmail="" />
        )}
      </div>
    </div>
  );
}
