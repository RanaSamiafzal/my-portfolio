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

export async function loadSettings() {
  return getSiteSettings();
}

export async function loadProjects() {
  return listProjects();
}

export async function loadExperience() {
  return getExperience();
}

export async function loadSkills() {
  return getSkillGroups();
}

export async function loadMarquee() {
  return getMarqueeStack();
}

export async function loadFaq() {
  return getFaq();
}

export async function loadProfile() {
  return (await loadSettings()).profile;
}

export async function loadServices() {
  return (await loadSettings()).services;
}

export async function loadTicker() {
  return (await loadSettings()).ticker;
}

export async function loadTheme() {
  return (await loadSettings()).theme;
}

export async function loadHero() {
  return (await loadSettings()).hero;
}

export async function loadProject(slug: string) {
  const fromList = (await loadProjects()).find((p) => p.slug === slug);
  if (fromList) return fromList;
  return getProjectBySlug(slug);
}

export async function loadStackUsage() {
  const projects = await loadProjects();
  return stackUsageFrom(projects);
}
