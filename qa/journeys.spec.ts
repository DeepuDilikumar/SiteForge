import { expect, test, type Page } from "@playwright/test";
import { settle, signIn, step } from "./helpers";

test.use({ viewport: { width: 1440, height: 900 } });

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@qa.test`;
}

async function signUpPage(page: Page, name: string, label: string) {
  await page.goto("/signup?next=/dashboard");
  await page.getByLabel("Your name").fill(name);
  await page.getByLabel("Email").fill(uniqueEmail(label));
  await page.getByLabel("Password").fill("qa-password-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((url) => url.pathname === "/dashboard");
}

async function buildFromPage(page: Page) {
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await expect(page.getByText("Reading reviews")).toBeVisible();
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
}

test("logged-out search → Build site → sign up → site built → workspace", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("plumbers, bakeries, salons…").fill("bakeries");
  await page.getByPlaceholder("Trivandrum, Austin…").fill("Kochi");
  await step(page, "journey1-1-landing", 1500);
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/\/search\?/);
  const firstRow = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Build site" }) }).first();
  const businessName = (await firstRow.getByRole("heading").textContent())?.trim() ?? "";
  await step(page, "journey1-2-results");

  await firstRow.getByRole("button", { name: "Build site" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(`Create a free account to build a site for ${businessName}`);
  await dialog.getByLabel("Your name").fill("Quinn Operator");
  await dialog.getByLabel("Email").fill(uniqueEmail("journey1"));
  await dialog.getByLabel("Password").fill("qa-password-1");
  await step(page, "journey1-3-signup-dialog", 300);
  await dialog.getByRole("button", { name: "Create account" }).click();

  await page.waitForURL(/\/build\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(businessName);
  await expect(page.getByText("1 free site left this month.")).toBeVisible();
  await step(page, "journey1-4-build", 3000);

  await buildFromPage(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(businessName);
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
  await step(page, "journey1-5-workspace", 2500);

  await page.getByRole("button", { name: "Get live link" }).click();
  await expect(page.getByRole("dialog")).toContainText("Live links are part of Pro.");
  await step(page, "journey1-6-live-link-is-pro", 300);
});

test("free user's 2nd site → upgrade dialog → pricing → checkout → build continues", async ({ page }) => {
  await signUpPage(page, "Riya Free", "journey2");
  await page.goto("/search?what=plumbers&where=Trivandrum");
  await page.getByRole("button", { name: "Build site" }).first().click();
  await page.waitForURL(/\/build\//);
  await buildFromPage(page);

  await page.goto("/search?what=salons&where=Kochi");
  await page.getByRole("button", { name: "Build site" }).first().click();
  await page.waitForURL(/\/build\//);
  const buildUrl = new URL(page.url()).pathname;
  await expect(page.getByText("You've used your free site this month.")).toBeVisible();
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("You've used your free site for this month.");
  await step(page, "journey2-1-upgrade-dialog", 2500);

  await dialog.getByRole("button", { name: "Upgrade to Pro" }).click();
  await page.waitForURL(/\/pricing\?from=limit/);
  await step(page, "journey2-2-pricing");
  await page.getByRole("link", { name: "Upgrade to Pro" }).click();
  await page.waitForURL(/\/checkout\?/);
  await expect(page.getByText("Test mode — no real charge")).toBeVisible();
  await step(page, "journey2-3-checkout");
  await page.getByRole("button", { name: "Confirm upgrade" }).click();
  await page.waitForURL(/\/checkout\/success/);
  await expect(page.getByRole("heading", { name: "You're on Pro" })).toBeVisible();
  await step(page, "journey2-4-success", 200);

  await page.waitForURL((url) => url.pathname === buildUrl || url.pathname.startsWith("/sites/"), { timeout: 15_000 });
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
  await step(page, "journey2-5-built-after-upgrade", 1500);
});

test("pro: Get live link → Send to owner → Open WhatsApp → mark contacted → dashboard", async ({ page, context }) => {
  await signIn(page, "pro@demo.dev");
  await page.goto("/search?what=dentists&where=Kochi");
  await page.getByRole("button", { name: "Build site" }).first().click();
  await page.waitForURL(/\/build\//);
  const name = (await page.getByRole("heading", { level: 1 }).textContent())?.trim() ?? "";
  await buildFromPage(page);

  await page.getByRole("button", { name: "Get live link" }).click();
  const published = page.getByRole("dialog");
  await expect(published).toContainText("Live link ready");
  const liveUrl = (await published.getByRole("link").first().textContent())?.trim() ?? "";
  expect(liveUrl).toMatch(/\/s\/[a-z0-9-]+$/);
  await step(page, "journey3-1-live-link", 1500);

  const live = await context.newPage();
  await live.setViewportSize({ width: 390, height: 844 });
  const response = await live.goto(liveUrl);
  expect(response?.status()).toBe(200);
  await expect(live.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await step(live, "journey3-2-live-site-phone", 1500);
  await live.close();

  await published.getByRole("button", { name: "Send to owner" }).click();
  await expect(page.getByRole("complementary", { name: "Send to owner" })).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).toHaveValue(/I built a website for you, here it is: /, { timeout: 30_000 });
  await step(page, "journey3-3-outreach");

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Open WhatsApp" }).click();
  const popup = await popupPromise;
  expect(popup.url()).toMatch(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//);
  await popup.close();

  const prompt = page.getByRole("status").filter({ hasText: "Mark as contacted?" });
  await expect(prompt).toBeVisible();
  await step(page, "journey3-4-mark-contacted", 300);
  await prompt.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByText("Marked as contacted")).toBeVisible();

  await page.goto("/dashboard");
  const row = page.getByRole("listitem").filter({ hasText: name });
  await expect(row.getByRole("combobox")).toHaveValue("contacted");
  await step(page, "journey3-5-dashboard", 2500);
});

test("Gemini failure → clear error, credit not used, retry works", async ({ page, context, baseURL }) => {
  await signUpPage(page, "Sam Retry", "journey4");
  const host = new URL(baseURL ?? "http://localhost:3000").hostname;
  await context.addCookies([{ name: "sf_simulate_ai_failure", value: "1", domain: host, path: "/" }]);
  await page.goto("/search?what=mechanics&where=Bangalore");
  await page.getByRole("button", { name: "Build site" }).first().click();
  await page.waitForURL(/\/build\//);
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await expect(page.getByText("We couldn't build this site. Your free credit wasn't used.")).toBeVisible({ timeout: 30_000 });
  await step(page, "journey4-1-build-failed", 300);

  await page.goto("/dashboard");
  await expect(page.getByText("Free · 1 of 1 free site left")).toBeVisible();
  await page.goBack();

  await context.clearCookies({ name: "sf_simulate_ai_failure" });
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
  await settle(page, 300);
  await step(page, "journey4-2-retry-built", 2000);
});
