import { expect, test } from "@playwright/test";
import { SHOTS, settle, signIn } from "./helpers";

test.use({ viewport: { width: 1440, height: 900 } });

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@qa.test`;
}

async function signUpInDialog(page: import("@playwright/test").Page, email: string) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your name").fill("Quinn Operator");
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Password").fill("qa-password-1");
  await dialog.getByRole("button", { name: "Create account" }).click();
}

async function buildFromPage(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await expect(page.getByText("Reading reviews")).toBeVisible();
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
}

test("logged-out search → Build site → sign up → site built → workspace", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("plumbers, bakeries, salons…").fill("bakeries");
  await page.getByPlaceholder("Trivandrum, Austin…").fill("Kochi");
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/\/search\?/);
  const firstRow = page.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Build site" }) }).first();
  const businessName = (await firstRow.getByRole("heading").textContent())?.trim() ?? "";
  await firstRow.getByRole("button", { name: "Build site" }).click();
  await expect(page.getByRole("dialog")).toContainText(`Create a free account to build a site for ${businessName}`);
  await signUpInDialog(page, uniqueEmail("journey1"));

  await page.waitForURL(/\/build\//);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(businessName);
  await expect(page.getByText("1 free site left this month.")).toBeVisible();
  await buildFromPage(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(businessName);
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
  await settle(page, 1500);
  await page.screenshot({ path: `${SHOTS}/journey1-workspace.png` });
});

test("free user's 2nd site → upgrade dialog → pricing → checkout → build continues", async ({ page }) => {
  await page.goto("/signup?next=/dashboard");
  await page.getByLabel("Your name").fill("Riya Free");
  await page.getByLabel("Email").fill(uniqueEmail("journey2"));
  await page.getByLabel("Password").fill("qa-password-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((url) => url.pathname === "/dashboard");

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
  await settle(page, 400);
  await page.screenshot({ path: `${SHOTS}/journey2-upgrade-dialog.png` });

  await dialog.getByRole("button", { name: "Upgrade to Pro" }).click();
  await page.waitForURL(/\/pricing\?from=limit/);
  await page.getByRole("link", { name: "Upgrade to Pro" }).click();
  await page.waitForURL(/\/checkout\?/);
  await expect(page.getByText("Test mode — no real charge")).toBeVisible();
  await page.getByRole("button", { name: "Confirm upgrade" }).click();
  await page.waitForURL(/\/checkout\/success/);
  await expect(page.getByRole("heading", { name: "You're on Pro" })).toBeVisible();

  await page.waitForURL((url) => url.pathname === buildUrl || url.pathname.startsWith("/sites/"), { timeout: 15_000 });
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
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
  await settle(page, 300);
  await page.screenshot({ path: `${SHOTS}/journey3-live-link.png` });

  const live = await context.newPage();
  const response = await live.goto(liveUrl);
  expect(response?.status()).toBe(200);
  await expect(live.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await live.close();

  await published.getByRole("button", { name: "Send to owner" }).click();
  await expect(page.getByRole("complementary", { name: "Send to owner" })).toBeVisible();
  const message = page.getByLabel("Message", { exact: true });
  await expect(message).toHaveValue(/I built a website for you, here it is: /, { timeout: 30_000 });
  await settle(page, 300);
  await page.screenshot({ path: `${SHOTS}/journey3-outreach.png` });

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Open WhatsApp" }).click();
  const popup = await popupPromise;
  expect(popup.url()).toMatch(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//);
  await popup.close();

  await page.getByRole("status").filter({ hasText: "Mark as contacted?" }).getByRole("button", { name: "Yes" }).click();
  await expect(page.getByText("Marked as contacted")).toBeVisible();

  await page.goto("/dashboard");
  const row = page.getByRole("listitem").filter({ hasText: name });
  await expect(row.getByRole("combobox")).toHaveValue("contacted");
});

test("Gemini failure → clear error, credit not used, retry works", async ({ page, context, baseURL }) => {
  await page.goto("/signup?next=/dashboard");
  await page.getByLabel("Your name").fill("Sam Retry");
  await page.getByLabel("Email").fill(uniqueEmail("journey4"));
  await page.getByLabel("Password").fill("qa-password-1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL((url) => url.pathname === "/dashboard");

  const host = new URL(baseURL ?? "http://localhost:3000").hostname;
  await context.addCookies([{ name: "sf_simulate_ai_failure", value: "1", domain: host, path: "/" }]);
  await page.goto("/search?what=mechanics&where=Bangalore");
  await page.getByRole("button", { name: "Build site" }).first().click();
  await page.waitForURL(/\/build\//);
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await expect(page.getByText("We couldn't build this site. Your free credit wasn't used.")).toBeVisible({ timeout: 30_000 });
  await settle(page, 300);
  await page.screenshot({ path: `${SHOTS}/journey4-build-failed.png` });

  await page.goto("/dashboard");
  await expect(page.getByText("Free · 1 of 1 free site left")).toBeVisible();
  await page.goBack();

  await context.clearCookies({ name: "sf_simulate_ai_failure" });
  await page.getByRole("button", { name: "Build site", exact: true }).click();
  await page.waitForURL(/\/sites\//, { timeout: 45_000 });
  await expect(page.getByRole("button", { name: "Get live link" })).toBeVisible();
});
