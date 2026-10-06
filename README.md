# Rana Muhammad Sami — Portfolio

Personal portfolio of a full-stack engineer. A Turborepo monorepo with a Next.js App Router site, a Three.js particle portrait, NextAuth sign-in, and Neon Postgres.

## Structure

```
apps/
  web/                 Next.js 16 site (App Router, Tailwind v4)
packages/
  content/             Typed profile, projects, experience, skills, FAQ — single source of truth
  db/                  Neon Postgres client, queries and SQL migrations
  ui/                  Shared React primitives (SectionLabel, Tag, Pill, Card…)
  tsconfig/            Shared TypeScript configs
```

## Routes

| Route | What it is |
| --- | --- |
| `/` | Hero with Three.js particle portrait, services, live GitHub stats, featured work, experience, AGENTS.md, FAQ |
| `/work` | Filterable project index (by category and technology) |
| `/work/[slug]` | Case studies (architecture, highlights, decisions) |
| `/stack` | Skills grouped by area, cross-referenced with projects |
| `/about` | Bio, at-a-glance card, timeline, education and courses |
| `/contact` | Contact form (stored in Postgres) and direct channels |
| `/guestbook` | Sign in with GitHub/Google (NextAuth) and leave a note |
| `/admin` | Private inbox — login with seeded DB admin (`/admin/login`) |
| `/llms.txt` | Plain-text profile for AI agents |
| `/api/hire` | `POST` a JSON brief from an AI agent; lands in the same inbox |

## Getting started

```bash
npm install
cp apps/web/.env.example apps/web/.env.local   # fill in DATABASE_URL
npm run db:migrate                              # create tables
npm run db:seed:admin                           # inject admin from packages/db/seeds/admin.json
npm run dev                                     # http://localhost:3100
```

The site runs without most env vars. Contact form + admin inbox need `DATABASE_URL`. Admin credentials live in `packages/db/seeds/admin.json` (seeded into Postgres) — not in `.env`. Guestbook social login optionally needs `AUTH_SECRET` + GitHub/Google OAuth.

## Editing content

All copy lives in `packages/content/src`. To add a project, append it to `projects.ts`. Give it a `caseStudy` to generate a `/work/<slug>` page automatically.

## Deploying (Vercel)

Set **Root Directory** to `apps/web`; Vercel detects Turborepo and builds the workspace packages. Then add these env vars from `.env.example`: `AUTH_SECRET` (optional unless OAuth), `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, and optionally `AUTH_GITHUB_ID/SECRET` and/or `AUTH_GOOGLE_ID/SECRET` for guestbook. Seed the admin once against production DB: `npm run db:seed:admin`. Point OAuth callback URLs at `https://<domain>/api/auth/callback/<provider>` if used.
