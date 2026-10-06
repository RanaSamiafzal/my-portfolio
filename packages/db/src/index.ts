import { scryptSync, timingSafeEqual } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type Message = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  interest: string | null;
  message: string;
  source: string;
  read: boolean;
  created_at: string;
};

export type GuestbookEntry = {
  id: number;
  author: string;
  avatar: string | null;
  body: string;
  created_at: string;
};

export type Admin = {
  id: number;
  email: string;
  name: string;
};

let client: NeonQueryFunction<false, false> | null = null;

/** True when a database is configured. Callers degrade gracefully when it isn't. */
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  client ??= neon(process.env.DATABASE_URL);
  return client;
}

function verifyPassword(plain: string, stored: string) {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const next = scryptSync(plain, salt, 64);
  const prev = Buffer.from(hash, "hex");
  if (prev.length !== next.length) return false;
  return timingSafeEqual(prev, next);
}

export async function countAdmins() {
  if (!hasDatabase()) return 0;
  const sql = db();
  try {
    const rows = await sql`SELECT COUNT(*)::int AS n FROM admins`;
    return (rows[0] as { n: number }).n;
  } catch {
    return 0;
  }
}

export async function isAdminEmail(email?: string | null) {
  if (!email || !hasDatabase()) return false;
  const sql = db();
  try {
    const rows = await sql`
      SELECT 1 FROM admins WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`;
    return rows.length > 0;
  } catch {
    return false;
  }
}

/** Verify email + password against the seeded admins table. */
export async function verifyAdminCredentials(email: string, password: string): Promise<Admin | null> {
  if (!hasDatabase() || !email || !password) return null;
  const sql = db();
  try {
    const rows = await sql`
      SELECT id::int AS id, email, name, password_hash
      FROM admins WHERE lower(email) = ${email.toLowerCase()} LIMIT 1`;
    const row = rows[0] as
      | { id: number; email: string; name: string; password_hash: string }
      | undefined;
    if (!row || !verifyPassword(password, row.password_hash)) return null;
    return { id: row.id, email: row.email, name: row.name };
  } catch {
    return null;
  }
}

export async function createMessage(input: {
  name: string;
  email: string;
  company?: string | null;
  interest?: string | null;
  message: string;
  source?: string;
}) {
  const sql = db();
  const rows = await sql`
    INSERT INTO messages (name, email, company, interest, message, source)
    VALUES (${input.name}, ${input.email}, ${input.company ?? null}, ${input.interest ?? null},
            ${input.message}, ${input.source ?? "form"})
    RETURNING id::int AS id`;
  return rows[0] as { id: number };
}

export async function listMessages(limit = 100) {
  const sql = db();
  return (await sql`SELECT *, id::int AS id FROM messages ORDER BY created_at DESC LIMIT ${limit}`) as Message[];
}

export async function markMessageRead(id: number, read: boolean) {
  const sql = db();
  await sql`UPDATE messages SET read = ${read} WHERE id = ${id}`;
}

export async function deleteMessage(id: number) {
  const sql = db();
  await sql`DELETE FROM messages WHERE id = ${id}`;
}

export async function listGuestbook(limit = 100) {
  if (!hasDatabase()) return [];
  const sql = db();
  return (await sql`
    SELECT id::int AS id, author, avatar, body, created_at FROM guestbook
    ORDER BY created_at DESC LIMIT ${limit}`) as GuestbookEntry[];
}

export async function createGuestbookEntry(input: { author: string; email: string; avatar?: string | null; body: string }) {
  const sql = db();
  const rows = await sql`
    INSERT INTO guestbook (author, email, avatar, body)
    VALUES (${input.author}, ${input.email}, ${input.avatar ?? null}, ${input.body})
    RETURNING id::int AS id`;
  return rows[0] as { id: number };
}

export async function deleteGuestbookEntry(id: number) {
  const sql = db();
  await sql`DELETE FROM guestbook WHERE id = ${id}`;
}

/** Rate-limit helper: entries a given email posted in the last window. */
export async function recentGuestbookCount(email: string, minutes = 10) {
  const sql = db();
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM guestbook
    WHERE email = ${email} AND created_at > NOW() - make_interval(mins => ${minutes})`;
  return (rows[0] as { n: number }).n;
}

export * from "./cms";

