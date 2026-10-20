import { NextResponse } from "next/server";
import { profile } from "@repo/content";
import { deliverInquiry } from "@/lib/deliver";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (rateLimited(`contact:${clientIp(req)}`)) {
    return NextResponse.json({ error: "Too many messages — please try again in a few minutes." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  // Bots fill the honeypot; pretend success.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { name, email, company, interest, message } = parsed.data;
  const result = await deliverInquiry({ name, contact: email, company: company || null, interest: interest || null, message, source: "form" });

  if (!result.ok) {
    return NextResponse.json(
      { error: `The inbox isn't reachable right now — please email ${profile.email} directly.` },
      { status: result.configured ? 502 : 503 },
    );
  }
  return NextResponse.json({ ok: true, stored: result.stored, emailed: result.emailed });
}
