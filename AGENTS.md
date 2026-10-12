<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Cloud Agent

- Install with `npm ci`. Check the repo with `npm run typecheck` and `npm run build`. `npm run lint` is a no-op (no package defines a lint task), and there is no automated test suite.
- `npm run dev` serves the site at http://localhost:3100. Next.js 16 serves dev assets and HMR for that hostname.
- The public site runs without secrets. A Neon `DATABASE_URL` in `apps/web/.env.local` enables the contact inbox, guestbook, and admin seed (`npm run db:migrate`, `npm run db:seed:admin`). Guestbook OAuth needs `AUTH_GITHUB_*` or `AUTH_GOOGLE_*`.
