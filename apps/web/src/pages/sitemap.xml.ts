import type { APIRoute } from "astro";
import { loadProjects } from "@/lib/content";
import { siteUrl } from "@/lib/site";
const escapeXml = (text: string) => text.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
export const GET: APIRoute = async () => {
  const projects = await loadProjects();
  const paths = ["/", "/about", "/work", "/stack", "/contact", "/guestbook", ...projects.filter((project) => project.caseStudy).map((project) => `/work/${encodeURIComponent(project.slug)}`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${escapeXml(new URL(path, siteUrl).href)}</loc></url>`).join("")}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
