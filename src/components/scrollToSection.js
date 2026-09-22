// Sections rendered by the page builder carry id="section-<anchorId>".
// These helpers scroll to them and are safe to call before the target mounts
// (retry), which matters because pages load their content asynchronously.
export function scrollToSection(value, options = {}) {
  const clean = String(value || "")
    .replace(/^#/, "")
    .trim();
  if (!clean || typeof document === "undefined") return false;

  const el =
    document.getElementById(`section-${clean}`) ||
    document.getElementById(clean);
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "start", ...options });
  return true;
}

export function scrollToHashRetry(hash, tries = 0, maxTries = 25) {
  if (scrollToSection(hash)) return;
  if (tries >= maxTries) return;
  setTimeout(() => scrollToHashRetry(hash, tries + 1, maxTries), 100);
}
