/** True on phones / touch / reduced-motion — skip WebGL & continuous RAF. */
export function prefersLiteExperience() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(max-width: 1023px)").matches ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
