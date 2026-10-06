/**
 * Seed / upsert the admin user from seeds/admin.json into Neon.
 *
 * Usage (from repo root):
 *   npm run db:seed:admin
 */
import { readFile } from "node:fs/promises";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to apps/web/.env.local).");
  process.exit(1);
}

const seedPath = new URL("../seeds/admin.json", import.meta.url);
const raw = JSON.parse(await readFile(seedPath, "utf8"));
const email = String(raw.email ?? "").trim().toLowerCase();
const password = String(raw.password ?? "");
const name = String(raw.name ?? "Admin").trim() || "Admin";

if (!email || !email.includes("@") || !password || password.length < 8) {
  console.error("seeds/admin.json needs email + password (min 8 chars).");
  process.exit(1);
}

function hashPassword(plain) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const passwordHash = hashPassword(password);
const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS admins (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const rows = await sql`
  INSERT INTO admins (email, name, password_hash)
  VALUES (${email}, ${name}, ${passwordHash})
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW()
  RETURNING id::int AS id, email, name
`;

const admin = rows[0];
console.log(`✓ Seeded admin #${admin.id}`);
console.log(`  email: ${admin.email}`);
console.log(`  name:  ${admin.name}`);
console.log(`  login: http://localhost:3100/admin/login`);
console.log(`  (password comes from packages/db/seeds/admin.json — change it there and re-run this seed)`);
