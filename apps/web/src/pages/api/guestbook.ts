import type { APIRoute } from "astro";
import { createGuestbookEntry, deleteGuestbookEntry, hasDatabase, recentGuestbookCount } from "@repo/db";
import { getSession } from "@/lib/session";
import { guestbookSchema } from "@/lib/validation";

export const POST: APIRoute = async ({ cookies, request, url }) => {
  if (request.headers.get("origin") !== url.origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getSession(cookies);
  if (!session) return Response.json({ error: "Please sign in first." }, { status: 401 });
  if (!hasDatabase()) return Response.json({ error: "Guestbook storage is unavailable." }, { status: 503 });
  const parsed = guestbookSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    if (await recentGuestbookCount(session.email) >= 3) return Response.json({ error: "Please wait before posting again." }, { status: 429 });
    await createGuestbookEntry({ author: session.name, email: session.email, avatar: session.image, body: parsed.data.body });
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Could not save your note. Try again." }, { status: 503 }); }
};

export const DELETE: APIRoute = async ({ cookies, request, url }) => {
  if (request.headers.get("origin") !== url.origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await getSession(cookies))?.isAdmin) return Response.json({ error: "Not authorized." }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (!Number.isSafeInteger(input?.id) || input.id <= 0) return Response.json({ error: "Invalid entry." }, { status: 400 });
  try {
    await deleteGuestbookEntry(input.id);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Could not delete this entry." }, { status: 503 }); }
};
