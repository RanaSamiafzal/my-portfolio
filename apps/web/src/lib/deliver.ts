import "server-only";
import { createMessage, hasDatabase } from "@repo/db";
import { hasMail, sendInquiryEmails, type Inquiry } from "@repo/mail";

export type Delivery = { ok: boolean; stored: boolean; emailed: boolean; id?: number; configured: boolean };

/**
 * Delivers an inquiry through every configured channel:
 * Neon Postgres (shows up in /admin) and Resend/SMTP (lands in your inbox).
 * Succeeds if at least one channel worked.
 */
export async function deliverInquiry(inq: Inquiry): Promise<Delivery> {
  const configured = hasDatabase() || hasMail();
  let stored = false;
  let emailed = false;
  let id: number | undefined;

  const [db, mail] = await Promise.allSettled([
    hasDatabase()
      ? createMessage({
          name: inq.name,
          email: inq.contact,
          company: inq.company ?? null,
          interest: inq.interest ?? null,
          message: inq.message,
          source: inq.source,
        })
      : Promise.resolve(null),
    hasMail() ? sendInquiryEmails(inq) : Promise.resolve(null),
  ]);

  if (db.status === "fulfilled" && db.value) {
    stored = true;
    id = db.value.id;
  } else if (db.status === "rejected") console.error("[deliver] database write failed:", db.reason);

  if (mail.status === "fulfilled" && hasMail()) emailed = true;
  else if (mail.status === "rejected") console.error("[deliver] mail send failed:", mail.reason);

  return { ok: stored || emailed, stored, emailed, id, configured };
}
