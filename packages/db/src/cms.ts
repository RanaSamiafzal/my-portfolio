import type { CaseStudy, Project, ProjectCategory, Role, SkillGroup } from "@repo/content";
import {
  experience as fallbackExperience,
  faq as fallbackFaq,
  marqueeStack as fallbackMarquee,
  profile as fallbackProfile,
  projects as fallbackProjects,
  services as fallbackServices,
  skillGroups as fallbackSkills,
  ticker as fallbackTicker,
  navLinks as fallbackNav,
} from "@repo/content";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

export type SiteTheme = {
  accent: string;
  accentSoft: string;
  cream: string;
  text: string;
  bg0: string;
};

export type HeroAssets = {
  desk: string;
  mask: string;
  matte: string;
  portrait: string;
};

export type SiteService = {
  id: string;
  title: string;
  body: string;
  tags: string[];
};

export type SiteNavLink = {
  href: string;
  label: string;
  index: string;
};

export type SiteProfile = {
  name: string;
  shortName: string;
  handle: string;
  role: string;
  headline: string;
  rotating: string[];
  intro: string;
  location: string;
  timezone: string;
  availability: string;
  email: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  cv: string;
  portrait: string;
  socials: { github: string; linkedin: string };
  githubUser: string;
  education: { degree: string; school: string; status: string };
  courses: { title: string; org: string; year: string }[];
  about: string[];
};

export type SiteSettings = {
  profile: SiteProfile;
  ticker: string[];
  services: SiteService[];
  navLinks: SiteNavLink[];
  theme: SiteTheme;
  hero: HeroAssets;
};

const defaultTheme: SiteTheme = {
  accent: "#00ff41",
  accentSoft: "#4ade80",
  cream: "#f5f1ea",
  text: "#f5f1ea",
  bg0: "#000000",
};

const defaultHero: HeroAssets = {
  desk: "/hero-desk.jpg",
  mask: "/hero-desk-mask.png",
  matte: "/hero-desk-matte.png",
  portrait: "/portrait.jpg",
};

let cmsClient: NeonQueryFunction<false, false> | null = null;

function sql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  cmsClient ??= neon(process.env.DATABASE_URL);
  return cmsClient;
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    slug: String(row.slug),
    name: String(row.name),
    tagline: String(row.tagline ?? ""),
    summary: String(row.summary ?? ""),
    period: String(row.period ?? ""),
    context: String(row.context ?? ""),
    status: (row.status as Project["status"]) ?? "Live",
    featured: Boolean(row.featured),
    categories: (row.categories as ProjectCategory[]) ?? [],
    tech: (row.tech as string[]) ?? [],
    stack: (row.stack as string[]) ?? [],
    links: (row.links as Project["links"]) ?? [],
    caseStudy: (row.case_study as CaseStudy | null) ?? undefined,
    image: row.image ? String(row.image) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
  };
}

export function stackUsageFrom(projects: Project[]) {
  const counts = new Map<string, string[]>();
  for (const p of projects) for (const t of p.tech) counts.set(t, [...(counts.get(t) ?? []), p.name]);
  const total = projects.length || 1;
  return [...counts.entries()]
    .map(([name, used]) => ({ name, count: used.length, pct: Math.round((used.length / total) * 100), projects: used }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function listProjects(): Promise<Project[]> {
  if (!hasDb()) return [...fallbackProjects];
  try {
    const rows = await sql()`SELECT * FROM projects ORDER BY sort_order ASC, name ASC`;
    if (!rows.length) return [...fallbackProjects];
    return rows.map((r) => rowToProject(r as Record<string, unknown>));
  } catch {
    return [...fallbackProjects];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!hasDb()) return fallbackProjects.find((p) => p.slug === slug);
  try {
    const rows = await sql()`SELECT * FROM projects WHERE slug = ${slug} LIMIT 1`;
    if (!rows.length) return fallbackProjects.find((p) => p.slug === slug);
    return rowToProject(rows[0] as Record<string, unknown>);
  } catch {
    return fallbackProjects.find((p) => p.slug === slug);
  }
}

export async function upsertProject(project: Project, sortOrder = 0) {
  const db = sql();
  await db`
    INSERT INTO projects (
      slug, name, tagline, summary, period, context, status, featured, sort_order,
      categories, tech, stack, links, case_study, image, image_url, updated_at
    ) VALUES (
      ${project.slug}, ${project.name}, ${project.tagline}, ${project.summary},
      ${project.period}, ${project.context}, ${project.status}, ${Boolean(project.featured)}, ${sortOrder},
      ${JSON.stringify(project.categories)}::jsonb, ${JSON.stringify(project.tech)}::jsonb,
      ${JSON.stringify(project.stack)}::jsonb, ${JSON.stringify(project.links)}::jsonb,
      ${project.caseStudy ? JSON.stringify(project.caseStudy) : null}::jsonb,
      ${project.image ?? null}, ${project.imageUrl ?? null}, NOW()
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
}

export async function deleteProject(slug: string) {
  await sql()`DELETE FROM projects WHERE slug = ${slug}`;
}

async function getDoc<T>(key: string, fallback: T): Promise<T> {
  if (!hasDb()) return fallback;
  try {
    const rows = await sql()`SELECT payload FROM content_docs WHERE key = ${key} LIMIT 1`;
    if (!rows.length) return fallback;
    return rows[0]!.payload as T;
  } catch {
    return fallback;
  }
}

async function setDoc(key: string, payload: unknown) {
  await sql()`
    INSERT INTO content_docs (key, payload, updated_at)
    VALUES (${key}, ${JSON.stringify(payload)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
  `;
}

export async function getExperience(): Promise<Role[]> {
  return getDoc("experience", [...fallbackExperience]);
}

export async function saveExperience(roles: Role[]) {
  await setDoc("experience", roles);
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  return getDoc("skill_groups", [...fallbackSkills]);
}

export async function saveSkillGroups(groups: SkillGroup[]) {
  await setDoc("skill_groups", groups);
}

export async function getMarqueeStack(): Promise<string[]> {
  return getDoc("marquee_stack", [...fallbackMarquee]);
}

export async function saveMarqueeStack(items: string[]) {
  await setDoc("marquee_stack", items);
}

export async function getFaq(): Promise<{ q: string; a: string }[]> {
  return getDoc("faq", fallbackFaq.map((f) => ({ q: f.q, a: f.a })));
}

export async function saveFaq(items: { q: string; a: string }[]) {
  await setDoc("faq", items);
}

function defaultSettings(): SiteSettings {
  return {
    profile: {
      ...fallbackProfile,
      rotating: [...fallbackProfile.rotating],
      about: [...fallbackProfile.about],
      courses: fallbackProfile.courses.map((c) => ({ ...c })),
      education: { ...fallbackProfile.education },
      socials: { ...fallbackProfile.socials },
    },
    ticker: [...fallbackTicker],
    services: fallbackServices.map((s) => ({ ...s, tags: [...s.tags] })),
    navLinks: fallbackNav.map((n) => ({ ...n })),
    theme: { ...defaultTheme },
    hero: { ...defaultHero },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const base = defaultSettings();
  if (!hasDb()) return base;
  try {
    const rows = await sql()`SELECT payload FROM site_settings WHERE id = 1 LIMIT 1`;
    if (!rows.length) return base;
    const payload = rows[0]!.payload as Partial<SiteSettings>;
    return {
      profile: { ...base.profile, ...(payload.profile ?? {}) },
      ticker: payload.ticker ?? base.ticker,
      services: payload.services ?? base.services,
      navLinks: payload.navLinks ?? base.navLinks,
      theme: { ...base.theme, ...(payload.theme ?? {}) },
      hero: { ...base.hero, ...(payload.hero ?? {}) },
    };
  } catch {
    return base;
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  await sql()`
    INSERT INTO site_settings (id, payload, updated_at)
    VALUES (1, ${JSON.stringify(settings)}::jsonb, NOW())
    ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
  `;
}

export async function getProfile() {
  return (await getSiteSettings()).profile;
}

export async function getServices() {
  return (await getSiteSettings()).services;
}

export async function getTicker() {
  return (await getSiteSettings()).ticker;
}

export async function getTheme() {
  return (await getSiteSettings()).theme;
}

export async function getHeroAssets() {
  return (await getSiteSettings()).hero;
}
