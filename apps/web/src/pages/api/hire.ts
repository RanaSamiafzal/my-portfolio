import { z } from "zod";
import type { APIRoute } from "astro";
import { profile } from "@repo/content";
import { deliverInquiry } from "@/lib/deliver";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { hireSchema } from "@/lib/validation";

export const GET: APIRoute = async () =>
  Response.json({
    endpoint: "POST /api/hire",
    body: {
      name: "string",
      contact: "email or phone",
      brief: "string (10+ chars)",
      budget: "optional",
      agent: "optional",
    },
    profile: "/llms.txt",
    human: `mailto:${profile.email}`,
  });

export const POST: APIRoute = async ({ request }) => {
  if (rateLimited(`hire:${clientIp(request)}`, 3)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = hireSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "invalid_body", issues: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
  }
  const { name, contact, brief, budget, agent } = parsed.data;
  const result = await deliverInquiry({
    name,
    contact,
    interest: budget ? `Agent brief · budget ${budget}` : "Agent brief",
    message: brief,
    source: `agent:${agent ?? "unknown"}`,
  });
  if (!result.ok) {
    return Response.json(
      { error: "inbox_unavailable", fallback: `mailto:${profile.email}` },
      { status: result.configured ? 502 : 503 },
    );
  }
  return Response.json(
    {
      ok: true,
      id: result.id ?? null,
      stored: result.stored,
      emailed: result.emailed,
      reply: "Thanks — Sami usually replies within a day.",
    },
    { status: 201 },
  );
};
