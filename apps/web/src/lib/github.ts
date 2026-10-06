import { profile } from "@repo/content";

export type GitHubStats = {
  publicRepos: number;
  stars: number;
  followers: number;
  languages: string[];
  languageShare: { name: string; pct: number }[];
  lastPush: string | null;
  since: number;
};

const FALLBACK: GitHubStats = {
  publicRepos: 14,
  stars: 0,
  followers: 1,
  languages: ["JavaScript", "TypeScript", "CSS", "HTML"],
  languageShare: [
    { name: "JavaScript", pct: 64 },
    { name: "TypeScript", pct: 27 },
    { name: "CSS", pct: 9 },
  ],
  lastPush: null,
  since: 2025,
};

type Repo = { stargazers_count: number; language: string | null; pushed_at: string; fork: boolean };

/** Live GitHub numbers, cached for an hour; falls back to known values if the API is unreachable. */
export async function getGitHubStats(): Promise<GitHubStats> {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const opts = { headers, next: { revalidate: 3600 } };

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${profile.githubUser}`, opts),
      fetch(`https://api.github.com/users/${profile.githubUser}/repos?per_page=100&sort=pushed`, opts),
    ]);
    if (!userRes.ok || !reposRes.ok) return FALLBACK;

    const user = (await userRes.json()) as { public_repos: number; followers: number; created_at: string };
    const repos = ((await reposRes.json()) as Repo[]).filter((r) => !r.fork);

    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const total = ranked.reduce((sum, [, n]) => sum + n, 0) || 1;

    return {
      languageShare: ranked.slice(0, 4).map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) })),
      publicRepos: user.public_repos,
      followers: user.followers,
      stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      languages: ranked.map(([l]) => l),
      lastPush: repos[0]?.pushed_at ?? null,
      since: new Date(user.created_at).getFullYear(),
    };
  } catch {
    return FALLBACK;
  }
}
