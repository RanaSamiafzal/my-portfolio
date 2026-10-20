import type { APIRoute } from "astro";
import { verifyAdminCredentials } from "@repo/db";
import { createSession } from "@/lib/session";
import { clientIp, rateLimited } from "@/lib/rate-limit";

export const POST: APIRoute = async ({ request, cookies, url }) => {
  if (request.headers.get("origin") !== url.origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (rateLimited(`login:${clientIp(request)}`, 8)) return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return Response.json({ error: "Sign in is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (email.length > 200 || password.length > 1024) return Response.json({ error: "Invalid credentials." }, { status: 400 });
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const admin = await verifyAdminCredentials(email, password);
  if (!admin) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(cookies, {
    id: String(admin.id),
    email: admin.email,
    name: admin.name,
    isAdmin: true,
  });

  return Response.json({ ok: true });
};
