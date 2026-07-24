export const THEME_KEY = "forjar-theme";

export const THEMES = ["original", "aurora", "ocean", "eclipse"] as const;

export type AppTheme = (typeof THEMES)[number];

export const THEME_LABELS: Record<AppTheme, string> = {
  original: "Original",
  aurora: "Aurora",
  ocean: "Oceano",
  eclipse: "Eclipse",
};

export function isAppTheme(value: string | null): value is AppTheme {
  return Boolean(value && THEMES.includes(value as AppTheme));
}

export function getSavedTheme(): AppTheme {
  if (typeof window === "undefined") return "original";
  const saved = window.localStorage.getItem(THEME_KEY);
  return isAppTheme(saved) ? saved : "original";
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme =
    theme === "original" || theme === "eclipse" ? "dark" : "light";
}

export function saveTheme(theme: AppTheme) {
  if (typeof window !== "undefined") window.localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}
