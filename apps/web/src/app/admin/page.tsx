import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { hasDatabase, listMessages } from "@repo/db";
import { Card, SectionLabel, Tag, cn } from "@repo/ui";
import { auth } from "@/auth";
import { adminSignOut, removeMessage, toggleRead } from "./actions";

export const metadata: Metadata = { title: "Inbox", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (!session.user.isAdmin) {
    return (
      <div className="container-x py-32 text-center">
        <p className="font-mono text-sm text-accent">403</p>
        <p className="mt-3 font-medium text-3xl">This inbox is private.</p>
        <form action={adminSignOut} className="mt-8">
          <button className="btn-outline">Sign out</button>
        </form>
      </div>
    );
  }

  const messages = hasDatabase() ? await listMessages() : [];
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="container-x pb-24 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel index="AD">Admin</SectionLabel>
          <h1 className="mt-5 font-medium text-5xl tracking-tight">Inbox</h1>
          <p className="mt-3 font-mono text-xs text-muted-soft">
            {messages.length} messages · {unread} unread {!hasDatabase() && "· DATABASE_URL not set"}
          </p>
        </div>
        <form action={adminSignOut}>
          <button className="font-mono text-xs text-muted-soft hover:text-accent">SIGN OUT</button>
        </form>
      </div>
      <div className="mt-10 space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={cn("p-6", !m.read && "border-accent/40")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg text-text">
                  {!m.read && <span className="mr-2 text-accent">●</span>}
                  {m.name} {m.company && <span className="text-muted-soft">· {m.company}</span>}
                </p>
                <a href={m.email.includes("@") ? `mailto:${m.email}` : undefined} className="font-mono text-xs text-accent">
                  {m.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {m.interest && <Tag>{m.interest}</Tag>}
                <Tag>{m.source}</Tag>
                <span className="font-mono text-[11px] text-muted-soft">{fmt.format(new Date(m.created_at))}</span>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-muted">{m.message}</p>
            <div className="mt-5 flex gap-4 font-mono text-xs">
              <form action={toggleRead.bind(null, m.id, !m.read)}>
                <button className="text-muted hover:text-accent">{m.read ? "MARK UNREAD" : "MARK READ"}</button>
              </form>
              <form action={removeMessage.bind(null, m.id)}>
                <button className="text-muted hover:text-red-400">DELETE</button>
              </form>
            </div>
          </Card>
        ))}
        {messages.length === 0 && <p className="font-mono text-sm text-muted-soft">Inbox zero.</p>}
      </div>
    </div>
  );
}
