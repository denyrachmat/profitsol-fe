export const HEADER_SLOTS = ["left", "center", "right"];

// Slots shown in the editor. "background" renders as a layer behind the others.
export const HEADER_EDITOR_SLOTS = ["background", "left", "center", "right"];

export const HEADER_WIDGETS = [
  "html",
  "text",
  "image",
  "button",
  "spacer",
  "divider",
];

// A single header configuration (no scroll variant).
export const baseHeaderConfig = () => ({
  enabled: true,
  sticky: true,
  elevated: true,
  background: "#ffffff",
  textColor: "#000000",
  height: "64px",
  maxWidth: "",
  // Horizontal padding of the header content (background stays full-bleed).
  padding: "0 12px",
  // CSS transition applied to background/color/height (empty = none).
  transition: "0.25s ease",
  // Color for the built-in buttons (empty = per-button default).
  defaultButtonsColor: "",
  // Built-in (default) buttons rendered by the frontpage header.
  defaultButtons: { menu: true, account: true, notifications: true, help: true },
  slots: { background: [], left: [], center: [], right: [] },
});

// Full config = base + optional "on scroll" variant.
export const defaultHeaderConfig = () => ({
  ...baseHeaderConfig(),
  scrolled: { enabled: false, threshold: 80, config: baseHeaderConfig() },
});

export const normalizeBaseConfig = (raw) => {
  const base = baseHeaderConfig();
  if (!raw || typeof raw !== "object") return base;
  const { scrolled, ...rest } = raw;
  return {
    ...base,
    ...rest,
    defaultButtonsColor:
      typeof rest.defaultButtonsColor === "string" ? rest.defaultButtonsColor : "",
    defaultButtons: {
      menu: rest.defaultButtons?.menu !== false,
      account: rest.defaultButtons?.account !== false,
      notifications: rest.defaultButtons?.notifications !== false,
      help: rest.defaultButtons?.help !== false,
    },
    slots: {
      background: Array.isArray(rest.slots?.background) ? rest.slots.background : [],
      left: Array.isArray(rest.slots?.left) ? rest.slots.left : [],
      center: Array.isArray(rest.slots?.center) ? rest.slots.center : [],
      right: Array.isArray(rest.slots?.right) ? rest.slots.right : [],
    },
  };
};

export const normalizeHeaderConfig = (raw) => {
  const base = normalizeBaseConfig(raw);
  const scrolled = raw && typeof raw === "object" ? raw.scrolled : null;
  return {
    ...base,
    scrolled: {
      enabled: !!(scrolled && scrolled.enabled),
      threshold:
        scrolled && scrolled.threshold != null
          ? Number(scrolled.threshold) || 0
          : 80,
      config: normalizeBaseConfig(scrolled && scrolled.config),
    },
  };
};

// Normalize a CSS size value. A bare number (or numeric string) gets "px",
// so old configs saved as `64` still work. Any other CSS length
// (px, rem, em, %, vh, auto, calc(...)) passes through unchanged.
export const cssSize = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  if (str === "") return "";
  if (/^-?\d+(\.\d+)?$/.test(str)) return `${str}px`;
  return str;
};
