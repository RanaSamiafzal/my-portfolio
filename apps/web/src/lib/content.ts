import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  getExperience,
  getFaq,
  getMarqueeStack,
  getProjectBySlug,
  getSiteSettings,
  getSkillGroups,
  listProjects,
  stackUsageFrom,
} from "@repo/db";

const TAG = "site-content";

/** Cross-request cache; invalidated via updateTag("site-content") on CMS save. */
const cachedSettings = unstable_cache(async () => getSiteSettings(), ["site-settings"], {
  tags: [TAG],
  revalidate: 3600,
});

const cachedProjects = unstable_cache(async () => listProjects(), ["site-projects"], {
  tags: [TAG],
  revalidate: 3600,
});

const cachedExperience = unstable_cache(async () => getExperience(), ["site-experience"], {
  tags: [TAG],
  revalidate: 3600,
});

const cachedSkills = unstable_cache(async () => getSkillGroups(), ["site-skills"], {
  tags: [TAG],
  revalidate: 3600,
});

const cachedMarquee = unstable_cache(async () => getMarqueeStack(), ["site-marquee"], {
  tags: [TAG],
  revalidate: 3600,
});

const cachedFaq = unstable_cache(async () => getFaq(), ["site-faq"], {
  tags: [TAG],
  revalidate: 3600,
});

/** Request-scoped + cross-request cached loaders. */
export const loadSettings = cache(cachedSettings);
export const loadProjects = cache(cachedProjects);
export const loadExperience = cache(cachedExperience);
export const loadSkills = cache(cachedSkills);
export const loadMarquee = cache(cachedMarquee);
export const loadFaq = cache(cachedFaq);

export const loadProfile = cache(async () => (await loadSettings()).profile);
export const loadServices = cache(async () => (await loadSettings()).services);
export const loadTicker = cache(async () => (await loadSettings()).ticker);
export const loadTheme = cache(async () => (await loadSettings()).theme);
export const loadHero = cache(async () => (await loadSettings()).hero);

export const loadProject = cache(async (slug: string) => {
  const fromList = (await loadProjects()).find((p) => p.slug === slug);
  if (fromList) return fromList;
  return getProjectBySlug(slug);
});

export async function loadStackUsage() {
  const projects = await loadProjects();
  return stackUsageFrom(projects);
}
