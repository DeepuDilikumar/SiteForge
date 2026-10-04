import { cookies } from "next/headers";
import { THEME_COOKIE, parseTheme, type Theme } from "./theme";

export async function getTheme(): Promise<Theme> {
  return parseTheme((await cookies()).get(THEME_COOKIE)?.value);
}
