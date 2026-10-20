import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { loadProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await loadProjects();
  const pages = ["", "/work", "/stack", "/about", "/contact", "/guestbook"].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const cases = projects.filter((p) => p.caseStudy).map((p) => ({ url: `${siteUrl}/work/${p.slug}`, priority: 0.8 }));
  return [...pages, ...cases];
}
