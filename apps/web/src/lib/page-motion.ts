/** Native, interruptible motion. Server content is always readable without JS. */
export function initPageMotion() {
  const stage = document.getElementById("page-stage");
  if (!stage || location.pathname.startsWith("/admin")) return;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(0.16,1,0.3,1)";
  const animations = new Set<Animation>();
  const seen = new WeakSet<Element>();
  const observed = new WeakSet<Element>();
  const active = new Set<HTMLElement>();
  let frame = 0;
  let registration = 0;
  const play = (el: Element, frames: Keyframe[], duration = 850, delay = 0) => {
    const animation = el.animate(frames, { duration, delay, easing: ease, fill: "backwards" });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    return animation;
  };
  const flushPending = () => {
    for (const element of pending) reveal(element);
    pending.clear();
  };
  const reveal = (element: Element) => {
    if (seen.has(element) || preference.matches) return;
    seen.add(element);
    // Start below the viewport; never dim text the visitor is already reading
    // after an anchor jump, restored position or a fast scroll.
    if (!element.isConnected || element.getBoundingClientRect().top < innerHeight * .85) return;
    if (element.matches(".project-entry")) {
      const image = element.querySelector(".project-entry-visual");
      if (image) play(image, [
        { clipPath: "inset(20% 0 0 0 round 16px)", transform: "translateY(40px)", opacity: .35 },
        { clipPath: "inset(0% 0 0 0 round 16px)", transform: "none", opacity: 1 },
      ], 1100);
      element.querySelectorAll(".project-entry-copy > *").forEach((row, index) => {
        play(row, [{ opacity: .4 }, { opacity: 1 }], 500, 60 + index * 35);
      });
    } else if (element.matches("[data-tagline]")) {
      element.querySelectorAll("span").forEach((word, index) => {
        play(word, [{ opacity: .4 }, { opacity: 1 }], 600, index * 35);
      });
    } else {
      // Text stays in its final position. Opacity reveals don't change line breaks
      // or move the reader's target while native/smooth scrolling is in progress.
      play(element, [{ opacity: .45 }, { opacity: 1 }], 600);
    }
  };
  const pending = new Set<Element>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (document.documentElement.hasAttribute("data-page-intro")) pending.add(entry.target);
      else if (entry.boundingClientRect.bottom > 0) reveal(entry.target);
      else seen.add(entry.target);
    }
  }, { rootMargin: "0px 0px 120px 0px" });
  const updateScroll = () => {
    frame = 0;
    if (preference.matches || document.hidden) return;
    const height = innerHeight;
    // Read all geometry before writing styles.
    const positions = Array.from(active, element => ({ element, rect: element.getBoundingClientRect() }));
    for (const { element, rect } of positions) {
      const media = element.querySelector<HTMLElement>(".project-media-drift");
      if (media) media.style.transform = innerWidth > 767
        ? `translateY(${Math.max(-10, Math.min(10, (height / 2 - rect.top - rect.height / 2) * .025))}px) scale(1.05)` : "none";
    }
  };
  const schedule = () => { if (!frame && !preference.matches) frame = requestAnimationFrame(updateScroll); };
  const scrollObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) active.add(entry.target as HTMLElement);
      else active.delete(entry.target as HTMLElement);
    }
    schedule();
  }, { rootMargin: "120px" });
  const register = () => {
    registration = 0;
    if (preference.matches) return;
    document.querySelectorAll<HTMLElement>("main h2, .project-entry, [data-reveal]").forEach(element => {
      if (observed.has(element) || element.closest(".cinematic-hero")) return;
      if (element.matches("h2") && element.closest("astro-island")) return;
      observed.add(element);
      if (element.matches(".project-entry")) scrollObserver.observe(element);
      // Each heading/project owns its reveal, so ancestors can't animate twice.
      if (!element.matches("h2, .project-entry") && (element.querySelector("h2, .project-entry") || element.closest(".project-entry"))) return;
      observer.observe(element);
    });
    for (const element of active) if (!element.isConnected) active.delete(element);
  };
  window.addEventListener("portfolio:intro-complete", flushPending);
  register();
  const mutations = new MutationObserver(() => {
    if (!registration) registration = requestAnimationFrame(register);
  });
  mutations.observe(stage, { childList: true, subtree: true });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("focusin", event => {
    for (const animation of animations) {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      if (target instanceof Element && event.target instanceof Node && target.contains(event.target)) animation.finish();
    }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
  window.addEventListener("pagehide", () => { animations.forEach(animation => animation.cancel()); });
  preference.addEventListener("change", () => {
    if (preference.matches) {
      animations.forEach(animation => animation.cancel());
      document.querySelectorAll<HTMLElement>("[data-tagline] span, .project-media-drift").forEach(element => {
        element.style.removeProperty("opacity"); element.style.removeProperty("transform");
      });
    } else { register(); schedule(); }
  });
}
