"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { THEME_COOKIE, type Theme } from "@/lib/theme";

/** Light is the default; this switches to dark and remembers the choice in a cookie. */
export function ThemeToggle({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <IconButton
      icon={theme === "dark" ? "light_mode" : "dark_mode"}
      label={next === "dark" ? "Switch to dark theme" : "Switch to light theme"}
      onClick={() => {
        document.documentElement.dataset.theme = next;
        document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        setTheme(next);
      }}
    />
  );
}
