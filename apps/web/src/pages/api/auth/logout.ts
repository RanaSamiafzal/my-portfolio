import type { APIRoute } from "astro";
import { destroySession } from "@/lib/session";

export const POST: APIRoute = async ({ cookies, request, url }) => {
  if (request.headers.get("origin") !== url.origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  destroySession(cookies);
  return Response.json({ ok: true });
};
