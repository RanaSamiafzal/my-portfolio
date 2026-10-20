# Portfolio motion direction

Reviewed 20 October 2026. Direction: black editorial portfolio, warm white type, lime details, one interactive WebGL portrait, and restrained scroll choreography.

## References and what they contribute

- [Dennis Snellenberg — Awwwards](https://www.awwwards.com/sites/dennis-snellenberg): Site of the Day, 4 April 2022, and Developer Award. The award listing identifies parallax, transitions and microinteractions. Reference for purposeful motion and legible project presentation. [Live portfolio](https://dennissnellenberg.com/).
- [Dark Minimal Creative Agency — Dribbble](https://dribbble.com/shots/27555469-Portfolio-Website-Exploration-Dark-Minimal-Creative-Agency), Nabhan LD for Rukous: a static design concept with dark surfaces, generous spacing and image-led project grids. Used for composition; this is not an award-winning live implementation.
- [Dark portfolio pin — Pinterest](https://uk.pinterest.com/pin/portfolio-web-design-inspiration-on-dark-theme--259731103485962557/): public pin featuring an editorial dark portfolio. Used for contrast and large project imagery. The sign-in prompt limits broader browsing; no private boards were accessed.
- [Mobbin public homepage](https://mobbin.com/): reference for readable typography, navigation hierarchy and clear calls to action. Only the public homepage was inspected, not the paid screen/flow library.

## Implemented

1. The circular aperture now reveals the entire public page, including navigation, headline and portrait, with a 1.8-second zoom-out. The portrait no longer runs a separate competing entrance. Its replay control replays the page entrance and resets the portrait.
2. Project screenshots reveal through a rising mask; metadata, titles, descriptions and links follow in a short stagger. Desktop screenshot interiors drift slightly while scrolling; mobile uses the reveal without parallax.
3. Static section headings reveal by word, preserving line breaks. The large statement brightens word by word with scroll progress.
4. Wheel, touch, keyboard or focus immediately ends the intro. Back/forward navigation and hash links bypass it. Reduced motion skips the effects, and server-rendered content remains visible without JavaScript.

These references inform the pacing and hierarchy. Existing identity, portfolio content and portrait remain the foundation. Native browser animations and observers handle the motion; no additional animation library is needed.

## Verification

- Astro check: 99 files, zero errors, warnings or hints. Vercel production build passed.
- Browser: eight routes at 375, 390 and 1440 pixels; all 24 checks returned HTTP 200 with no horizontal overflow, broken images or page JavaScript errors. Mobile menu passed.
- Captured circular reveal frames on desktop and mobile; verified initial load, refresh, replay and keyboard/wheel interruption. Intro restores `clip-path: none` and `transform: none`.
- Verified project entry animations, heading word spans, category filtering and animation registration after filtering.
- Verified reduced-motion page visibility, dynamic preference changes, and visible server content with JavaScript disabled.

## Editorial implementation

The recommended visual direction is now implemented on the homepage and shared navigation/project components:

- Compact floating navigation with a persistent active-page underline and visible keyboard focus.
- Warm white and muted grey headline treatment with restrained lime punctuation and interaction details.
- A full-width lead project with a larger screenshot and a separate introduction; following projects use an offset two-column grid on desktop and a single column on mobile.
- Clickable screenshot previews with case-study actions on hover and focus, plus an explicit link to the full collection.
- Numbered section labels, a unified services panel, and a large contact statement with a circular action and direct email link.
- Existing circular page reveal, project entry choreography, word reveals and WebGL portrait work together with this layout. New hover movement is limited to fine pointers and respects reduced motion.

Editorial revision verification: Astro check passed with zero diagnostics and the Vercel production build passed. All 24 route/viewport checks passed at 375, 390 and 1440px, including mobile menu and no-JavaScript visibility. Additional checks at 320, 375, 768, 1024 and 1440px verified responsive lead-project placement, keyboard focus on image actions, navigation into the Brandly case study, the contact action, and no horizontal overflow. Desktop/mobile hero, work and contact screenshots were visually reviewed.

## Approved cinematic hero (current direction)

The user approved [this generated hero concept](design/hero-approved.png). Only the hero and its home navigation are redesigned in this pass; subsequent sections await section-by-section review.

The implementation uses live HTML typography and the existing Three.js portrait: outlined lime stippling on CREATIVE, warm white ENGINEER, a central portrait layered in front, a lime orbit, minimal Work/About/Contact navigation, short side captions, and a bottom work link. The reference image is documentation, not the rendered website background. The laptop is revealed from the original portrait using a procedural shader mask. Mobile fits the portrait within its viewport and retains accessible scene controls, a menu and the work link.

This supersedes the earlier word-mask scroll treatment. Headings now fade once as complete blocks without changing their DOM, line breaks or position. Project copy also uses opacity only. The statement reveals once and stays readable when scrolling back, rather than dimming again with scroll progress. Whole-page refresh reveal and image parallax remain interruptible and respect reduced motion.

Cinematic hero verification: Astro check passed (99 files, zero errors, warnings or hints); Vercel production build passed. All 24 route/viewport checks passed without overflow, missing images or page JavaScript errors. Software WebGL checks verified drag, keyboard scatter, form switching, replay, pause and offscreen draw suspension. Layouts also passed at 320, 375, 768, 1024 and 1920px. Reduced-motion, unavailable-WebGL and no-JavaScript fallbacks passed. A separate scroll check verified fixed heading geometry, no word-wrapper DOM changes, opacity-only pre-entry fades, and no dimming when jumping directly to visible text. Desktop, mobile and no-JavaScript screenshots were visually reviewed.

## Scroll-controlled entrance (current behavior)

The home page now starts with the same CREATIVE / ENGINEER type above a small circular portal. Its aperture and zoom follow native scroll progress rather than a refresh timer. The actual page stays pinned during the entrance, while the portrait/WebGL assets can load behind it. At completion the temporary scroll runway is removed and the remaining scroll offset is preserved, so normal page scrolling continues without jumping or leaving a blank spacer.

The original poster remains until the renderer has drawn its first WebGL frame. The entrance does not wait on the GPU or a network request: scrolling, the enter button, Skip intro, Escape and skip-to-content remain usable. Native touch scrolling is supported. Reduced motion, no JavaScript, hash destinations, browser-restored positions and inner pages show content directly. The replay control restarts this entrance. The home page uses native scrolling so two scrolling engines cannot compete over the aperture progress.

Scroll-entry verification: Astro check passed (100 files, zero diagnostics) and the Vercel production build passed. All 24 route/viewport checks passed without overflow, missing images or page errors. Dedicated desktop/mobile checks verified idle state beyond five seconds, progressive/reversible aperture growth, pinned page geometry, native scroll after completion, oversized-scroll offset preservation, enter/replay/skip/Escape/skip-to-content, real touch swipe, landscape resizing, reduced motion, no JavaScript, hashes and inner pages. Delayed portrait assets stayed behind the intro without auto-opening it. A WebGL draw-call probe confirmed the ready state occurs after the first rendered frame.

## User-supplied workstation illustration

The hero now uses the supplied landscape workstation image (`public/hero-workstation.png`), copied unchanged from the original 1672 × 941 PNG. The portrait composition retains the complete laptop, charger, phone and clock. The chair backdrop is masked out to match the earlier cutout treatment. Its original colors remain on the WebGL surface; a shared vector silhouette preserves dark hair and clothing while layering the subject in front of the headline. The desk is a subdued grounding shadow rather than an opaque white strip.

The image surface and sampled particles use the landscape aspect ratio. Desktop and mobile fit the scene without stretching, and the loading/no-JavaScript/WebGL-unavailable poster shares its frame and silhouette. Scroll entry reveals this same scene; the first real GPU frame still controls the poster handoff. Existing drag, local displacement, scatter, form morphs, replay and pause remain available. Social preview metadata also uses the active hero asset. Stored built-in `/hero-desk.jpg` settings resolve to the new illustration; custom uploaded hero URLs retain their previous behavior.

Workstation verification: Astro check passed across 100 files with zero diagnostics; Vercel production build passed. Desktop/mobile screenshots and the no-JavaScript poster were visually reviewed. Browser checks passed at 320, 375, 390, 768, 1024, 1440 and 1920px without overflow or page errors. Verified drag, keyboard scatter, form switching/reset, pause/offscreen draw suspension, fixed text geometry, mobile navigation, reduced motion and unavailable WebGL. Scroll checks passed for progressive/reversible reveal, native touch, delayed new mask loading, replay/skip, first-frame readiness, landscape resizing and overshoot handoff.


### Portrait correction and laser sweep

The workstation now follows the earlier central cutout composition: larger subject, higher framing, sampled portrait texture and a quiet desk shadow. Source-space vector outlines preserve the full laptop and forearms; the desk shadow is drawn beneath the opaque subject silhouette so it cannot cut through the image. Hover displacement of the image surface is restrained to keep the illustration legible.

Click/tap scatters the source-colored particles radially from the interaction point, fades the surface during the impulse, then reconstructs it with exponential damping. The impulse has stronger particle opacity/size and a longer settle. Touch coordinates are initialized on pointer-down; keyboard activation scatters from the center. CREATIVE gets a diagonal clipped laser sweep over a duplicate glyph layer; its text geometry stays fixed. The sweep waits for the scroll intro to complete and is disabled with reduced motion.

Correction verification: Astro check passed (100 files, zero diagnostics) and Vercel production build passed. Visually reviewed corrected desktop/mobile and no-JavaScript portraits. Browser checks verified visible click-driven scatter/reconstruction, distinct laser sweep positions, reduced-motion suppression, accessible headline without duplicate generated text, no-JavaScript and unavailable-WebGL posters. Existing interaction checks passed pause/draw suspension, pointer drag, keyboard scatter, form reset/replay, stable text geometry and responsive navigation/anchors at 320/375/768/1024/1920px before the generated-text accessibility issue was found and corrected; targeted accessibility/fallback rechecks passed. First-frame readiness, reversible scroll, overshoot handoff and landscape skip passed.

## Static workstation and independent dotted sculpture (current behavior)

The supplied workstation now renders as an ordinary server-rendered image. It has no pointer handlers, GPU surface, particle sampling, scan line, displacement, fading impulse, rotation or morph. The silhouette mask keeps the laptop and subject intact and includes the entire original cream table at full opacity. All added desk gradients, shadow ellipses and edge fades are removed. Captions over the desktop/tablet table use dark text and dark rule marks; mobile captions sit below the image and retain light text.

An independent React/Three.js island renders a lime dotted knot beside and over the upper-right part of the workstation. It supports drag/arrow rotation, click/Enter pulse, knot/sphere switching and pause. These interactions affect only geometry and never alter the image. Its rendering stops when paused/settled, offscreen or hidden and respects reduced motion. A missing WebGL context leaves the photo visible. The compact controls include replay of the existing scroll entrance. CREATIVE retains its diagonal laser sweep.

Static-workstation verification: Astro check passed across 101 files with zero diagnostics and the Vercel production build passed. Browser checks confirmed a pixel crop of the artwork remains identical after clicking the photo, pulsing the sculpture and changing its form. Separate sculpture drag, keyboard pulse, form switch, pause/draw suspension, offscreen suspension and scroll-intro replay passed. Layouts passed at 320/375/390/768/1024/1920px without horizontal overflow; desktop/tablet captions sit within the table bounds and use dark text. Mobile menu, no-JavaScript, reduced-motion and unavailable-WebGL photo visibility passed. Desktop/mobile screenshots were visually reviewed with the complete laptop and full-opacity table.

## Autonomous sculpture (current interaction)

The dotted sculpture now cycles through knot, sphere and torus automatically, with a 5.5-second idle interval and damped morphing. Manual replay/form/pause controls and their styles are removed. Cursor entry pauses the automatic clock and rotation, while the dots respond locally to the pointer and the form tilts toward it. Click/pointer-down advances the shape and pulses; dragging rotates it and can advance another shape during a longer gesture. On pointer exit, the pointer influence eases away and idle rotation/cycling continues from the current pose. Touch release/cancellation resumes idle motion. Arrow keys rotate and Enter/Space change form; keyboard engagement clears on blur.

The drawing area grows around the previous canvas center: 240 → 304px desktop, 180 → 228px tablet, and 140 → 188px mobile. The sculpture's anchor and the static workstation/captions remain unchanged. Reduced motion disables idle animation and pointer displacement; explicit shape changes settle immediately. Offscreen/hidden rendering still suspends, with GPU resources and listeners disposed on cleanup.

Autonomous-sculpture verification: Astro check passed across 101 files with zero diagnostics; Vercel production build passed. Browser checks verified automatic form changes, larger canvas with exactly the previous center, no manual buttons, pointer response, automatic-clock suspension while hovering, click/drag form changes and automatic continuation after exit. Layouts passed at 320/390/768/1024/1920px without horizontal overflow. Keyboard form changes, reduced-motion static rendering and offscreen draw suspension passed with no page errors. Desktop/mobile screenshots were reviewed.

## Homepage project gallery (current design)

The selected-work section now uses server-rendered wide product showcases instead of the lead card and offset grid. Its heading, project count and collection links introduce the existing featured CMS projects. Each charcoal panel has a numbered category/status row, large project title, concise original tagline, technologies, an explicit case-study or external-project action, and a real screenshot displayed at its full aspect ratio. Desktop alternates copy/preview positions; tablet and mobile put the image first. Period, categories and available source links form a compact footer. No project data or case-study content is rewritten.

The design is isolated in `SelectedProjects.astro` and gallery-scoped CSS. Hero artwork, autonomous sculpture, other homepage sections and the `/work` collection retain their current behavior. Existing one-shot image reveals and opacity-only copy reveals apply; heading geometry stays fixed. Keyboard focus reveals the same image action as hover, mobile has a persistent text action, and content/links render without JavaScript.

Project-gallery verification: Astro check passed across 102 files with zero diagnostics; Vercel production build passed. Browser checks passed at 320/390/768/1024/1440/1920px: all four featured projects and images loaded, alternating desktop/image-first mobile placement was correct, and there was no horizontal overflow. Verified explicit link targets, external-link attributes, keyboard navigation, the preview action on keyboard focus, navigation to the Brandly case study, the hero's selected-work anchor, fixed heading geometry, no word splitting, no-JavaScript rendering and the existing `/work` collection. Desktop/mobile screenshots were visually reviewed; no page errors were recorded.

## Approved overlapping project chapters (current design and motion)

The user approved [the immersive chapter concept](design/projects-approved.png) and requested that each following project rise over and replace the previous one on scroll. The homepage now implements that composition as live HTML: oversized project names, floating real screenshots, restrained lime orbit, concise metadata, circular project actions and a numbered chapter rail. Project content and routes still come from the CMS.

Each full-screen scene uses native sticky positioning inside one stack. A short reading interval precedes the next scene entering from below. As the incoming chapter covers the outgoing one, the old content scales down to 95.5% and fades behind it; the incoming top corners resolve into a clean full-screen scene. All progress follows scroll position and reverses immediately when scrolling back. No wheel/touch input is intercepted and no animation library is added. `project-stack.ts` shares the existing page-motion scroll scheduler and batches marker-position reads before transform/opacity writes.

Non-sticky anchor markers keep chapter navigation and hash entry reliable. Covered scenes become inert, reverse scrolling restores them, and keyboard focus aligns the next project instantly. Mouse activation does not trigger the keyboard alignment. Normal page scrolling continues after the final chapter. No-JavaScript, reduced-motion and viewports shorter than a complete scene use a normal document flow with every project and link accessible. Dynamic motion-preference changes and history restoration are supported. The intro's temporary scale does not affect scene-height measurement.

Stacked-chapter verification: Astro check passed across 103 files with zero diagnostics; Vercel production build passed. Browser checks verified outgoing pinning, incoming slide/overlap, monotonic depth fade, full coverage, restoration on reverse scroll and inert covered links. Chapter anchors, keyboard advance, case-study/back navigation and normal scrolling after the last scene passed. All titles, images, actions and chapter navigation fit at 320×640, 375×812, 390×844, 768×1024, 1024×900 and 1920×1080. Native touch swipes drove the overlap. Reduced motion, no JavaScript, short landscape and dynamic preference changes kept every project accessible. Existing desktop/mobile intro progress, overshoot handoff and hero work anchors passed. No page errors were recorded. Desktop/mobile starting and overlapping frames were visually reviewed.

## Editorial project gallery (current design; overlap removed)

The homepage selected-work section replaces the full-screen chapters with an open, asymmetric gallery. A compact section index and “Less talk. More building.” heading introduce four real project screenshots. Desktop alternates wide and narrow columns with offset rows; mobile uses a single column. Each preview preserves the full source aspect ratio, followed by the CMS project title, original tagline, status, period and three technologies. Case-study and external destinations remain unchanged. A collection link closes the section.

The previous sticky chapter styles, anchor markers, chapter navigation, scale/fade progression, inert handling and `project-stack.ts` module are removed. Projects use normal document flow with no scroll-driven transform or overlap. Only preview hover/focus states animate; reduced motion removes those transitions. Keyboard focus exposes the preview action, and all content and links render without JavaScript. The hero, intro reveal, illustration and autonomous sculpture are unchanged. The earlier approved chapter mockup is historical, superseded by this request.

Verification: visually reviewed desktop and mobile gallery captures. Browser checks passed at 320/390/768/1024/1440/1920px with four loaded screenshots, no horizontal overflow, no intersecting project bounds and no sticky/fixed cards. Keyboard preview actions, Brandly case-study navigation, the existing work collection and no-JavaScript rendering passed without page errors. Desktop/mobile scroll intro, overshoot handoff and hero work anchors passed. Astro check passed across 102 files with zero diagnostics, and the Vercel production build passed.

### Larger sculpture at the same anchor

The sculpture canvas expands around its unchanged center from 304 to 448px on desktop, 228 to 324px on tablet and 188 to 252px on mobile. Only CSS size/bleed values change; all existing cursor guidance, click/drag morphing, automatic cycling and motion preferences retain their implementation.
