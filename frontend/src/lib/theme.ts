// frontend/lib/theme.ts
export const THEMES = [
  "service-web",
  "service-motion",
  "service-graphic",
  "service-dev",
  "service-printing",
] as const;

export type ThemeClass = (typeof THEMES)[number];

/** Детерминированно выбираем тему по slug, чтобы у каждой заметки была своя палитра */
export function themeFromSlug(slug: string): ThemeClass {
  if (!slug) return "service-web";
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return THEMES[h % THEMES.length];
}
