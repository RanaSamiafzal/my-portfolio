import { NextResponse } from "next/server";
import { profile } from "@repo/content";
import { deliverInquiry } from "@/lib/deliver";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { hireSchema } from "@/lib/validation";

/** Agent-facing endpoint documented in the AGENTS.md block on the home page. */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/hire",
    body: { name: "string", contact: "email or phone", brief: "string (10+ chars)", budget: "optional", agent: "optional" },
    profile: "/llms.txt",
    human: `mailto:${profile.email}`,
  });
}

export async function POST(req: Request) {
  if (rateLimited(`hire:${clientIp(req)}`, 3)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const parsed = hireSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
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
    return NextResponse.json({ error: "inbox_unavailable", fallback: `mailto:${profile.email}` }, { status: result.configured ? 502 : 503 });
  }
  const id = result.id ?? null;
  return NextResponse.json({ ok: true, id, stored: result.stored, emailed: result.emailed, reply: "Thanks — Sami usually replies within a day." }, { status: 201 });
}
