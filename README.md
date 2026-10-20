# Rana Muhammad Sami — Portfolio

Astro 5 SSR portfolio with React islands, Tailwind v4, Neon Postgres CMS, Auth.js social sign in, and a private admin inbox. Public pages use a dark studio design with warm white type, acid lime accents and an interactive Three.js/WebGL portrait made from the original desk illustration. The masked photo and depth particles share pointer distortion, click/Enter scatter, shape morphs, keyboard/drag rotation and pause/play. Portrait is the default; compact icon controls replace text tabs. Refresh or Replay plays a circular zoom-out reveal. Reduced motion, mobile rendering and a WebGL fallback are included.

## Structure

- `apps/web`: Astro pages, layouts, HTTP endpoints and React islands.
- `packages/content`: typed fallback profile, projects, experience, skills and FAQ.
- `packages/db`: Neon queries, CMS storage, migrations and seed scripts.
- `packages/mail`: inquiry notifications through Resend or SMTP.
- `packages/ui`: shared React primitives.

The `_legacy_next_app` directory is a reference archive from the migration. It is excluded from TypeScript checks and has no active routes.

## Local development

```sh
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

Open http://localhost:3100. Public pages work with fallback content when a database is unavailable. Use Node 22 and the npm version specified in `package.json`.

For persistent content and an admin account, configure `DATABASE_URL`, edit `packages/db/seeds/admin.json`, then run the following against the intended database:

```sh
npm run db:migrate
npm run db:seed:admin
npm run db:seed:content
```

Do not reseed an existing database just to apply a visual change. Existing CMS settings override fallback content and theme defaults.

## Routes and editing

Public routes: `/`, `/work`, `/work/[slug]`, `/stack`, `/about`, `/contact`, `/guestbook`. Case studies render on request so CMS edits and new projects appear without a rebuild.

`/admin/login` uses the seeded database credentials. `/admin` contains inbox read/unread/delete controls and links to projects, profile, experience, skills, FAQ, services and theme editors. CMS forms call authenticated Astro Actions. Image uploads use Vercel Blob when configured; local development falls back to `public/uploads`.

Guestbook sign in uses optional GitHub/Google providers through Auth.js Core. Set `AUTH_GITHUB_ID/SECRET` or `AUTH_GOOGLE_ID/SECRET`; callback URLs remain `/api/auth/callback/github` and `/api/auth/callback/google`. Guestbook entries are limited to three per email per ten minutes. Without provider credentials, the guestbook remains readable.

SEO routes: `/sitemap.xml`, `/robots.txt`, `/llms.txt`. Agents can read the contract at `GET /api/hire` and send a brief with `POST /api/hire`. Contact submissions use `POST /api/contact`.

## Validation

```sh
npm run typecheck
npm run build
```

## Vercel

Set the project Root Directory to `apps/web` and the framework to **Astro**. Build with `npm run build`; the Vercel adapter creates `.vercel/output`. `astro preview` cannot serve the Vercel adapter locally; use `npm run dev` for development and a Vercel preview for deployment validation.

Configure `PUBLIC_SITE_URL` with the public HTTPS origin, `DATABASE_URL`, and **`AUTH_SECRET`** (required for production sessions; generate with `openssl rand -base64 32`). Configure optional OAuth credentials, `BLOB_READ_WRITE_TOKEN`, and `RESEND_API_KEY` with `MAIL_FROM/MAIL_TO` or SMTP settings. Never rely on local filesystem uploads on Vercel.

Before production cutover, verify a Vercel preview: credentials login, CMS save and public refresh, inbox controls, Blob uploads, contact delivery, hire delivery, and OAuth callback plus guestbook posting. See [migration status](docs/ASTRO_MIGRATION_STATUS.md) for the current checkpoint.
