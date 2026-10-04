import { expect, type Page } from "@playwright/test";

export const SHOTS = "qa/screenshots";

export async function signIn(page: Page, email: string, password = "demo1234", next = "/dashboard") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => url.pathname === next.split("?")[0]);
}

export async function settle(page: Page, ms = 1200) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(ms);
}

export { expect };
