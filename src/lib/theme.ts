export type Theme = "light" | "dark";
export const THEME_COOKIE = "sf-theme";

export function parseTheme(value: string | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
