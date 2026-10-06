/**
 * Seed portfolio CMS tables from @repo/content (static fallback source).
 * Usage: npm run db:seed:content
 */
import { neon } from "@neondatabase/serverless";
import {
  experience,
  faq,
  marqueeStack,
  navLinks,
  profile,
  projects,
  services,
  skillGroups,
  ticker,
} from "../../content/src/index.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (add it to apps/web/.env.local).");
  process.exit(1);
}

const sql = neon(url);

const theme = {
  accent: "#00ff41",
  accentSoft: "#4ade80",
  cream: "#f5f1ea",
  text: "#f5f1ea",
  bg0: "#000000",
};

const hero = {
  desk: "/hero-desk.jpg",
  mask: "/hero-desk-mask.png",
  matte: "/hero-desk-matte.png",
  portrait: "/portrait.jpg",
};

const settings = {
  profile,
  ticker: [...ticker],
  services: services.map((s) => ({ ...s, tags: [...s.tags] })),
  navLinks: navLinks.map((n) => ({ ...n })),
  theme,
  hero,
};

await sql`
  INSERT INTO site_settings (id, payload, updated_at)
  VALUES (1, ${JSON.stringify(settings)}::jsonb, NOW())
  ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
`;
console.log("✓ site_settings");

await sql`
  INSERT INTO content_docs (key, payload, updated_at)
  VALUES ('experience', ${JSON.stringify(experience)}::jsonb, NOW())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
`;
await sql`
  INSERT INTO content_docs (key, payload, updated_at)
  VALUES ('skill_groups', ${JSON.stringify(skillGroups)}::jsonb, NOW())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
`;
await sql`
  INSERT INTO content_docs (key, payload, updated_at)
  VALUES ('marquee_stack', ${JSON.stringify(marqueeStack)}::jsonb, NOW())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
`;
await sql`
  INSERT INTO content_docs (key, payload, updated_at)
  VALUES ('faq', ${JSON.stringify(faq)}::jsonb, NOW())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
`;
console.log("✓ content_docs (experience, skills, marquee, faq)");

let order = 0;
for (const p of projects) {
  await sql`
    INSERT INTO projects (
      slug, name, tagline, summary, period, context, status, featured, sort_order,
      categories, tech, stack, links, case_study, image, image_url, updated_at
    ) VALUES (
      ${p.slug}, ${p.name}, ${p.tagline}, ${p.summary}, ${p.period}, ${p.context},
      ${p.status}, ${Boolean(p.featured)}, ${order},
      ${JSON.stringify(p.categories)}::jsonb, ${JSON.stringify(p.tech)}::jsonb,
      ${JSON.stringify(p.stack)}::jsonb, ${JSON.stringify(p.links)}::jsonb,
      ${p.caseStudy ? JSON.stringify(p.caseStudy) : null}::jsonb,
      ${p.image ?? null}, ${p.imageUrl ?? null}, NOW()
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      summary = EXCLUDED.summary,
      period = EXCLUDED.period,
      context = EXCLUDED.context,
      status = EXCLUDED.status,
      featured = EXCLUDED.featured,
      sort_order = EXCLUDED.sort_order,
      categories = EXCLUDED.categories,
      tech = EXCLUDED.tech,
      stack = EXCLUDED.stack,
      links = EXCLUDED.links,
      case_study = EXCLUDED.case_study,
      image = EXCLUDED.image,
      image_url = EXCLUDED.image_url,
      updated_at = NOW()
  `;
  order += 1;
}
console.log(`✓ projects (${projects.length})`);
console.log("Done. Edit content from /admin after login.");
