import { siteUrl } from "@/lib/site";
import { loadExperience, loadProfile, loadProjects, loadSkills } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const [profile, experience, projects, skillGroups] = await Promise.all([
    loadProfile(),
    loadExperience(),
    loadProjects(),
    loadSkills(),
  ]);

  const text = `# ${profile.name} — ${profile.role}

> ${profile.headline}. ${profile.location} (${profile.timezone}). ${profile.availability}.

## Contact
- Email: ${profile.email}
- Phone/WhatsApp: ${profile.phone}
- GitHub: ${profile.socials.github}
- LinkedIn: ${profile.socials.linkedin}
- CV (PDF): ${siteUrl}${profile.cv}
- Agent API: POST ${siteUrl}/api/hire  {name, contact, brief, budget?, agent?}

## Summary
${profile.about.join("\n\n")}

## Experience
${experience.map((r) => `- ${r.title} @ ${r.company} (${r.period}): ${r.points.join(" ")}`).join("\n")}

## Projects
${projects
  .map(
    (p) =>
      `- ${p.name} — ${p.tagline} [${p.status}, ${p.period}]. ${p.summary} Stack: ${p.stack.join(", ")}.${
        p.caseStudy ? ` Case study: ${siteUrl}/work/${p.slug}` : ""
      }${p.links.length ? ` Links: ${p.links.map((l) => l.href).join(" ")}` : ""}`,
  )
  .join("\n")}

## Skills
${skillGroups.map((g) => `- ${g.title}: ${g.items.join(", ")}`).join("\n")}

## Education
- ${profile.education.degree}, ${profile.education.school} (${profile.education.status})
${profile.courses.map((c) => `- ${c.title} — ${c.org} (${c.year})`).join("\n")}
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
