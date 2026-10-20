/**
 * Critical, dependency-free intro. Also embedded inline by BaseLayout so deferred
 * modules, hydration and WebGL cannot delay the first usable frame.
 * @param {HTMLElement} stage
 * @param {() => void} onComplete
 */
export function initScrollEntry(stage, onComplete) {
  const root = document.documentElement;
  const entry = document.getElementById("scroll-entry");
  const ring = entry?.querySelector("circle");
  const heading = /** @type {HTMLElement | null | undefined} */ (entry?.querySelector(".entry-heading"));
  const prompt = /** @type {HTMLElement | null | undefined} */ (entry?.querySelector(".entry-prompt"));
  const core = /** @type {HTMLElement | null | undefined} */ (entry?.querySelector(".entry-core"));
  const brand = /** @type {HTMLElement | null | undefined} */ (entry?.querySelector(".entry-brand"));
  const index = /** @type {HTMLElement | null | undefined} */ (entry?.querySelector(".entry-index"));
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  let active = false;
  let frame = 0;
  let distance = 0;
  let progress = 0;
  let lastPaint = -1;
  /** @param {number} n */
  const clamp = (n) => Math.max(0, Math.min(1, n));
  /** @param {number} n */
  const smooth = (n) => { const p = clamp(n); return p * p * (3 - 2 * p); };

  const paint = () => {
    frame = 0;
    if (!active || !entry) return;
    progress = clamp(scrollY / distance);
    if (progress >= 1) { finish(); return; }
    if (progress === lastPaint) return;
    lastPaint = progress;
    // Finish the aperture slightly before the runway ends, so the handoff is invisible.
    const reveal = smooth(progress / .88);
    const width = document.documentElement.clientWidth;
    const height = innerHeight;
    const x = width * .5, y = height * .62;
    const initial = Math.min(40, width * .09);
    const full = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 48;
    const radius = initial + (full - initial) * reveal;
    const scale = 1.18 - .18 * reveal;
    stage.style.clipPath = `circle(${radius / scale}px at ${x}px ${y}px)`;
    stage.style.transformOrigin = `${x}px ${y}px`;
    stage.style.transform = `scale(${scale})`;
    ring?.setAttribute("cx", String(x)); ring?.setAttribute("cy", String(y)); ring?.setAttribute("r", String(radius));
    if (heading) {
      heading.style.opacity = String(1 - smooth((progress - .06) / .38));
      heading.style.transform = `translate(-50%, -50%) translateY(${-24 * reveal}px) scale(${1 - .06 * reveal})`;
    }
    if (prompt) prompt.style.opacity = String(1 - smooth(progress / .25));
    if (core) core.style.opacity = String(1 - smooth(progress / .12));
    if (brand) brand.style.opacity = String(1 - smooth(progress / .25));
    if (index) index.style.opacity = String(1 - smooth(progress / .25));
    if (ring) ring.style.opacity = String(1 - smooth((progress - .45) / .4));
    entry.dataset.progress = progress.toFixed(3);
  };
  const schedule = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
  const clear = () => {
    stage.inert = false;
    stage.style.removeProperty("clip-path"); stage.style.removeProperty("transform"); stage.style.removeProperty("transform-origin");
    root.style.removeProperty("--entry-distance");
    delete root.dataset.pageIntro; delete root.dataset.entryScroll;
    if (root.dataset.entryRestoration) {
      history.scrollRestoration = root.dataset.entryRestoration === "manual" ? "manual" : "auto";
      delete root.dataset.entryRestoration;
    }
    delete root.dataset.entryReload;
  };
  function finish(focus = false) {
    if (!active) return;
    // Before: sticky page top = distance - scrollY. After: normal top = -remainder.
    const remainder = Math.max(0, scrollY - distance);
    active = false;
    cancelAnimationFrame(frame); frame = 0;
    const ownedFocus = entry?.contains(document.activeElement);
    clear();
    window.scrollTo({ top: remainder, behavior: "instant" });
    if (focus || ownedFocus) document.getElementById("main")?.focus({ preventScroll: true });
    onComplete();
  }
  const start = (replay = false) => {
    if (!entry || preference.matches || document.hidden) { clear(); return; }
    // Reloads deliberately restart the intro; history/hash navigation keeps its destination.
    if (!replay && root.dataset.entryReload === "true") window.scrollTo({ top: 0, behavior: "instant" });
    // Preserve hash destinations and browser-restored scroll positions on initial load.
    if (!replay && (location.hash || scrollY > 2)) { clear(); return; }
    active = true; progress = 0; lastPaint = -1;
    distance = Math.round(Math.max(480, Math.min(innerHeight * .9, 960)));
    root.style.setProperty("--entry-distance", `${distance}px`);
    root.dataset.entryScroll = "true";
    root.dataset.pageIntro = "scroll";
    stage.inert = true;
    if (replay) {
      window.scrollTo({ top: 0, behavior: "instant" });
      entry.querySelector("button[data-entry-enter]")?.focus({ preventScroll: true });
    }
    paint();
  };
  if (root.dataset.pageIntro === "pending") start();
  else clear();
  entry?.querySelector("[data-entry-enter]")?.addEventListener("click", () => {
    if (active) window.scrollTo({ top: distance, behavior: "smooth" });
  });
  entry?.querySelector("[data-entry-skip]")?.addEventListener("click", () => finish(true));
  // The existing skip-to-content link must work while the page itself is inert.
  document.querySelector('a[href="#main"]')?.addEventListener("click", () => finish());
  window.addEventListener("keydown", event => { if (active && event.key === "Escape") finish(true); });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => { if (active) { lastPaint = -1; schedule(); } }, { passive: true });
  window.addEventListener("portfolio:replay-intro", () => start(true));
  window.addEventListener("hashchange", () => {
    if (!active) return;
    finish();
    try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: "instant" }); } catch { /* Malformed hashes should still leave the page usable. */ }
  });
  window.addEventListener("pagehide", () => { if (active) finish(); });
  preference.addEventListener("change", () => { if (preference.matches && active) finish(true); });
  return { get active() { return active; } };
}
