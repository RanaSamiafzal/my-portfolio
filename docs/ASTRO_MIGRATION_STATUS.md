# Astro migration checkpoint

Updated 20 October 2026. Continued from Cursor plan `portfolio_visual_redesign_39530673.plan.md` (Astro migration + Precision Studio).

## State found on resume

The Astro scaffold and public routes existed as uncommitted work. Most plan statuses still said pending. Admin CMS pages were placeholders, inbox controls and guestbook posting were absent, OAuth had not been ported, the homepage hydrated as one React island, case studies were frozen at build time, and README described Next.js.

## Implemented

- Astro 5 SSR with Vercel, React islands, Tailwind v4, workspace resolution and local server environment loading.
- Real profile, projects, experience, skills, FAQ, services and theme editors backed by authenticated Astro Actions; project editor routes and inbox read/unread/delete controls.
- Credentials sessions and optional Auth.js Core GitHub/Google OAuth. Guestbook posting, per-email rate limit, admin deletion and logout.
- Session verification rejects malformed, expired and tampered tokens; production requires `AUTH_SECRET`; mutations check authorization and origin.
- Homepage shell in Astro with individual interactive islands and a full bleed color image. Static content stays readable without JavaScript; heavy scan/ASCII effects no longer load on the homepage.
- Precision Studio light tokens, readable mobile drawer, native desktop navigation, reduced motion, focus containment and readable product/terminal previews.
- Original seeded green/black theme upgrades on read to the new default. Custom CMS palettes stay intact; no database reseeding is required.
- Case studies render on request so CMS changes do not require rebuilding.
- Dynamic sitemap, robots, canonical/social metadata, favicon and custom 404.
- Astro README, env example and Turbo output/environment configuration.

## Verification

- Workspace typecheck passed with zero errors, warnings or hints.
- Vercel adapter production build passed. Final rerun recorded in the continuation session.
- Public routes `/`, `/about`, `/work`, `/work/brandly`, `/contact`, `/stack`, `/guestbook` plus `/admin/login` checked at 375px, 390px and 1440px: successful responses, no page JavaScript errors, no missing images or document width overflow.
- Credentials login with the existing seeded account passed. All eight CMS/editor routes rendered real fields. Blank project save returned `Slug is required.` without writing data. Removing a list row preserved edits in the remaining row.
- Unauthenticated CMS Actions returned 401; admin pages redirected to login; upload/guestbook mutations denied unauthenticated requests. Cross-origin login returned 403.
- Session checks passed for signed credentials and OAuth tokens, chunked OAuth cookies, tampering, malformed cookies, expiry, logout and missing production secret.
- SEO endpoints returned 200 and an unknown public route returned the custom 404. Homepage content remained visible with JavaScript disabled.

## Remaining release gates

1. Verify successful CMS persistence and public refresh, project deletion and inbox mutations against the intended test/preview database. This continuation did not change stored CMS content or inbox records.
2. Complete interactive GitHub/Google OAuth callbacks and guestbook posting/deletion on the intended origin.
3. Verify contact/hire delivery and Vercel Blob upload with the configured external services.
4. Review existing CMS portfolio copy for old framework/Three.js claims; fallback copy now describes Astro. Custom database content remains authoritative.
5. Deploy a Vercel preview with Root Directory `apps/web`, framework Astro, `PUBLIC_SITE_URL`, `AUTH_SECRET`, database and optional provider/mail/Blob variables, then repeat release smokes before production cutover.

Local browser checks do not establish production readiness. The legacy Next source is retained as an excluded reference archive; Astro is the only active app runtime.

## Design revision — dark interactive studio

The user replaced the Precision Studio light direction with a dark design and requested Three.js/WebGL interactivity. The current UI uses black/charcoal surfaces, warm white typography and acid lime accents. The homepage now leads with a custom GPU particle sculpture and puts selected projects immediately below it in a staggered editorial grid.

Scene controls: drag or arrow keys rotate; click, Enter or the Pulse button triggers a particle pulse; Knot/Sphere morphs the geometry; Pause/Play controls the idle rotation. The scene uses fewer particles and a capped frame rate/pixel ratio on mobile, stops rendering when offscreen or settled while paused, honors reduced motion, disposes GPU resources on unmount, and supplies a static fallback when WebGL is unavailable. Shared dark tokens also apply to work, about, stack, contact, guestbook and admin forms. Previous built-in light/green presets upgrade to the new default on read; custom CMS palettes remain intact.

Dark revision verification: all eight public/login routes passed at 375px, 390px and 1440px with no document overflow, missing images or page JavaScript errors. A software WebGL browser rendered the scene and verified shape switching, drag changing the rendered sculpture, pulse, pause/play, no draw calls after the scene settled while paused, no draw calls offscreen, static reduced-motion behavior, and the unavailable-WebGL fallback. Workspace typecheck and Vercel build are rerun after the revision. Physical mobile GPU performance remains device dependent.

## Portrait blend revision

The original CMS hero desk illustration and subject mask now feed the same WebGL scene. A masked image surface retains the face and hands; image-colored depth particles, subdued desk/laptop edge outlines, an orbit and a moving scan highlight blend it into the dark background. Pointer movement displaces nearby particles and bends the image surface; click/Enter scatters the particles before they reassemble. Portrait is the default mode; the same points morph into Knot or Sphere and back. The portrait rests facing the reader instead of continuously spinning through a flat image.

CMS `hero.desk`, `hero.mask` and `hero.matte` supply the assets. The original illustration is also the loading/no-JavaScript/WebGL fallback. Original asset files were not modified. Browser verification covered desktop/mobile rendering without overflow or page errors, drag, scatter, three mode controls, return to portrait, keyboard input, pause, offscreen rendering suspension, reduced motion and unavailable WebGL.

## Hero reveal refinement

Portrait remains the default without visible mode labels or text tabs. Three compact icon buttons offer Replay, Change form and Pause/Play, with accessible names and keyboard tooltips. Replay returns to the portrait and resets its pose. Refresh and replay run a 1.8-second circular aperture reveal with a zoom out and a fading expanding ring. Pause/Play controls both the reveal timeline and the WebGL scene. Reduced-motion users see the settled portrait immediately; the no-JavaScript poster remains visible. Desktop and 375px browser checks covered reload, replay, mode cycling/reset, pause/resume, no overflow/errors, reduced motion and no JavaScript.
