import { z } from "zod";
import type { APIRoute } from "astro";
import { profile } from "@repo/content";
import { deliverInquiry } from "@/lib/deliver";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const POST: APIRoute = async ({ request }) => {
  if (rateLimited(`contact:${clientIp(request)}`)) {
    return Response.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the highlighted fields.", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 },
    );
  }
  if (parsed.data.website) return Response.json({ ok: true });

  const { name, email, company, interest, message } = parsed.data;
  const result = await deliverInquiry({
    name,
    contact: email,
    company: company || null,
    interest: interest || null,
    message,
    source: "form",
  });

  if (!result.ok) {
    return Response.json(
      { error: `The inbox isn't reachable right now — please email ${profile.email} directly.` },
      { status: result.configured ? 502 : 503 },
    );
  }
  return Response.json({ ok: true, stored: result.stored, emailed: result.emailed });
};
