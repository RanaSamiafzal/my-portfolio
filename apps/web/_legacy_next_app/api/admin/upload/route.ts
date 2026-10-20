import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function safeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function saveLocal(file: File, folder: string) {
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const base = safeName(path.basename(file.name, ext)) || "image";
  const filename = `${base}-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${folder}/${filename}`, storage: "local" as const };
}

async function saveBlob(file: File, folder: string) {
  const ext = path.extname(file.name) || ".jpg";
  const base = safeName(path.basename(file.name, ext)) || "image";
  const pathname = `portfolio/${folder}/${base}-${Date.now()}${ext}`;
  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
    addRandomSuffix: false,
  });
  return { url: blob.url, storage: "blob" as const };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "projects");
  const folder = ["projects", "profile", "hero", "misc"].includes(folderRaw) ? folderRaw : "misc";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, GIF, or AVIF allowed" }, { status: 400 });
  }

  try {
    const result = process.env.BLOB_READ_WRITE_TOKEN
      ? await saveBlob(file, folder)
      : await saveLocal(file, folder);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 },
    );
  }
}
