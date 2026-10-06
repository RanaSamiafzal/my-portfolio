import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to apps/web/.env.local).");
  process.exit(1);
}

const sql = neon(url);
const dir = new URL("../sql/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const text = await readFile(new URL(file, dir), "utf8");
  for (const statement of text.split(";").map((s) => s.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  console.log(`applied ${file}`);
}
