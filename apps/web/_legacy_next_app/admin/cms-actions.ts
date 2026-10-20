"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Project, ProjectCategory, Role, SkillGroup } from "@repo/content";
import {
  deleteProject,
  getSiteSettings,
  saveExperience,
  saveFaq,
  saveMarqueeStack,
  saveSiteSettings,
  saveSkillGroups,
  upsertProject,
  type SiteService,
  type SiteSettings,
} from "@repo/db";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("Not authorised");
}

function revalidateSite() {
  updateTag("site-content");
  revalidatePath("/", "layout");
  revalidatePath("/work");
  revalidatePath("/stack");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/llms.txt");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
}

export type CmsState = { error?: string; ok?: boolean };

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/** One entry per line. */
function lines(raw: string): string[] {
  return raw
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Tags / tech: newlines or commas. */
function csv(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Paragraphs separated by blank lines. */
function paragraphs(raw: string): string[] {
  return raw
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function count(formData: FormData, prefix: string) {
  const n = Number(formData.get(`${prefix}_count`) ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 40) : 0;
}

function indexed(formData: FormData, prefix: string, i: number, field: string) {
  return str(formData, `${prefix}_${i}_${field}`);
}

function parseJson<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`Invalid JSON in ${label}`);
  }
}

export async function saveProjectAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  let slug = "";
  try {
    slug = str(formData, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug) return { error: "Slug is required." };

    const linkCount = count(formData, "link");
    const links =
      linkCount > 0
        ? Array.from({ length: linkCount }, (_, i) => ({
            label: indexed(formData, "link", i, "label"),
            href: indexed(formData, "link", i, "href"),
          })).filter((l) => l.label && l.href)
        : lines(str(formData, "links")).map((line) => {
            const [label, href] = line.split("|").map((s) => s.trim());
            return { label: label ?? "", href: href ?? "" };
          }).filter((l) => l.label && l.href);

    const project: Project = {
      slug,
      name: str(formData, "name"),
      tagline: str(formData, "tagline"),
      summary: str(formData, "summary"),
      period: str(formData, "period"),
      context: str(formData, "context"),
      status: (str(formData, "status") as Project["status"]) || "Live",
      featured: formData.get("featured") === "on",
      categories: csv(str(formData, "categories")) as ProjectCategory[],
      tech: csv(str(formData, "tech")),
      stack: csv(str(formData, "stack")),
      links,
      image: str(formData, "image") || undefined,
      imageUrl: str(formData, "imageUrl") || undefined,
    };

    const caseRaw = str(formData, "caseStudy");
    if (caseRaw) project.caseStudy = parseJson(caseRaw, "caseStudy");

    const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
    if (!project.name) return { error: "Name is required." };

    await upsertProject(project, sortOrder);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }

  revalidateSite();
  revalidatePath(`/work/${slug}`);
  revalidatePath(`/admin/projects/${slug}`);
  redirect(`/admin/projects/${slug}`);
}

export async function deleteProjectAction(slug: string) {
  await requireAdmin();
  await deleteProject(slug);
  revalidateSite();
  revalidatePath(`/admin/projects`);
}

export async function saveProfileAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const settings = await getSiteSettings();
    const courseCount = count(formData, "course");
    const courses = Array.from({ length: courseCount }, (_, i) => ({
      title: indexed(formData, "course", i, "title"),
      org: indexed(formData, "course", i, "org"),
      year: indexed(formData, "course", i, "year"),
    })).filter((c) => c.title);

    const profile: SiteSettings["profile"] = {
      ...settings.profile,
      name: str(formData, "name"),
      shortName: str(formData, "shortName"),
      handle: str(formData, "handle"),
      role: str(formData, "role"),
      headline: str(formData, "headline"),
      intro: str(formData, "intro"),
      location: str(formData, "location"),
      timezone: str(formData, "timezone"),
      availability: str(formData, "availability"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      phoneHref: str(formData, "phoneHref"),
      whatsapp: str(formData, "whatsapp"),
      cv: str(formData, "cv"),
      portrait: str(formData, "portrait"),
      githubUser: str(formData, "githubUser"),
      socials: {
        github: str(formData, "github"),
        linkedin: str(formData, "linkedin"),
      },
      education: {
        degree: str(formData, "degree"),
        school: str(formData, "school"),
        status: str(formData, "eduStatus"),
      },
      rotating: lines(str(formData, "rotating")),
      about: paragraphs(str(formData, "about")),
      courses,
    };

    settings.profile = profile;
    settings.ticker = lines(str(formData, "ticker"));
    await saveSiteSettings(settings);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveExperienceAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const n = count(formData, "role");
    const roles: Role[] = Array.from({ length: n }, (_, i) => ({
      year: indexed(formData, "role", i, "year"),
      period: indexed(formData, "role", i, "period"),
      title: indexed(formData, "role", i, "title"),
      company: indexed(formData, "role", i, "company"),
      location: indexed(formData, "role", i, "location"),
      points: lines(indexed(formData, "role", i, "points")),
      stack: csv(indexed(formData, "role", i, "stack")),
    })).filter((r) => r.title);

    await saveExperience(roles);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveSkillsAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const n = count(formData, "group");
    const groups: SkillGroup[] = Array.from({ length: n }, (_, i) => ({
      id: indexed(formData, "group", i, "id") || `group-${i + 1}`,
      title: indexed(formData, "group", i, "title"),
      blurb: indexed(formData, "group", i, "blurb"),
      items: csv(indexed(formData, "group", i, "items")),
    })).filter((g) => g.title);

    await saveSkillGroups(groups);
    await saveMarqueeStack(csv(str(formData, "marquee")));
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveFaqAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const n = count(formData, "faq");
    const items = Array.from({ length: n }, (_, i) => ({
      q: indexed(formData, "faq", i, "q"),
      a: indexed(formData, "faq", i, "a"),
    })).filter((f) => f.q);

    await saveFaq(items);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveServicesAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const settings = await getSiteSettings();
    const n = count(formData, "service");
    const services: SiteService[] = Array.from({ length: n }, (_, i) => ({
      id: indexed(formData, "service", i, "id") || String(i + 1).padStart(2, "0"),
      title: indexed(formData, "service", i, "title"),
      body: indexed(formData, "service", i, "body"),
      tags: csv(indexed(formData, "service", i, "tags")),
    })).filter((s) => s.title);

    settings.services = services;
    await saveSiteSettings(settings);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}

export async function saveThemeAction(_prev: CmsState, formData: FormData): Promise<CmsState> {
  await requireAdmin();
  try {
    const settings = await getSiteSettings();
    settings.theme = {
      accent: str(formData, "accent") || settings.theme.accent,
      accentSoft: str(formData, "accentSoft") || settings.theme.accentSoft,
      cream: str(formData, "cream") || settings.theme.cream,
      text: str(formData, "text") || settings.theme.text,
      bg0: str(formData, "bg0") || settings.theme.bg0,
    };
    settings.hero = {
      desk: str(formData, "desk") || settings.hero.desk,
      mask: str(formData, "mask") || settings.hero.mask,
      matte: str(formData, "matte") || settings.hero.matte,
      portrait: str(formData, "portrait") || settings.hero.portrait,
    };
    await saveSiteSettings(settings);
    revalidateSite();
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Save failed" };
  }
}
