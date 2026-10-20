import type { Metadata } from "next";
import Image from "next/image";
import { hasDatabase, listGuestbook } from "@repo/db";
import { Card, SectionLabel } from "@repo/ui";
import { auth, enabledProviders } from "@/auth";
import { GuestbookForm } from "@/components/guestbook-form";
import { removeEntry, signInWith, signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign in with GitHub or Google and leave a note.",
};
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function GuestbookPage() {
  const [session, entries] = await Promise.all([auth(), listGuestbook().catch(() => [])]);
  const user = session?.user;

  return (
    <div className="container-x pb-24 pt-16 md:pt-24">
      <SectionLabel index="04">Guestbook</SectionLabel>
      <h1 className="mt-5 h-display text-[clamp(2.6rem,7vw,5rem)] leading-none tracking-tight">Sign the wall.</h1>
      <p className="mt-6 max-w-[56ch] leading-relaxed text-muted">
        Recruiters, collaborators, fellow developers — sign in and leave a note. Authentication runs on NextAuth with GitHub and Google
        OAuth; entries are stored in Postgres.
      </p>

      <Card className="mt-12 p-6 md:p-8">
        {user ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {user.image && <Image src={user.image} alt="" width={36} height={36} className="rounded-full" />}
                <p className="text-sm text-muted">
                  Signed in as <span className="text-text">{user.name ?? user.email}</span>
                </p>
              </div>
              <form action={signOutAction}>
                <button className="font-mono text-xs text-muted-soft hover:text-accent">SIGN OUT</button>
              </form>
            </div>
            <GuestbookForm />
          </div>
        ) : enabledProviders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="mr-2 text-muted">Sign in to leave a message:</p>
            {enabledProviders.map((p) => (
              <form key={p.id} action={signInWith.bind(null, p.id)}>
                <button className="rounded-xl border border-line-bright px-4 py-2.5 text-text transition-colors hover:border-accent hover:text-accent">
                  Continue with {p.name}
                </button>
              </form>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-soft">Sign-in is being configured — check back soon.</p>
        )}
      </Card>

      <ul className="mt-12 space-y-3">
        {entries.map((e) => (
          <li key={e.id} className="flex gap-4 rounded-2xl border border-line p-5">
            {e.avatar ? (
              <Image src={e.avatar} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-2 font-mono text-accent">{e.author[0]}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="text-text">{e.author}</span>
                <span className="ml-3 font-mono text-[11px] text-muted-soft">{fmt.format(new Date(e.created_at))}</span>
              </p>
              <p className="mt-1 break-words text-muted">{e.body}</p>
            </div>
            {user?.isAdmin && (
              <form action={removeEntry.bind(null, e.id)}>
                <button className="font-mono text-[11px] text-muted-soft hover:text-red-400" aria-label="Delete entry">DEL</button>
              </form>
            )}
          </li>
        ))}
        {entries.length === 0 && (
          <li className="font-mono text-sm text-muted-soft">{hasDatabase() ? "No entries yet — be the first." : "Guestbook storage is not connected yet."}</li>
        )}
      </ul>
    </div>
  );
}
