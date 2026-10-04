import { test } from "@playwright/test";
import { SHOTS, settle, signIn } from "./helpers";

const SIZES = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const size of SIZES) {
  test.describe(`${size.name} screens`, () => {
    test.use({ viewport: { width: size.width, height: size.height } });

    test("public pages", async ({ page }) => {
      await page.goto("/");
      await settle(page, 2500);
      await page.screenshot({ path: `${SHOTS}/${size.name}-landing.png` });
      await page.screenshot({ path: `${SHOTS}/${size.name}-landing-full.png`, fullPage: true });

      await page.goto("/search?what=bakeries&where=Trivandrum");
      await page.getByRole("button", { name: "Build site" }).first().waitFor();
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/${size.name}-results.png`, fullPage: true });

      await page.getByRole("button", { name: "Build site" }).first().click();
      await settle(page, 600);
      await page.screenshot({ path: `${SHOTS}/${size.name}-signup-dialog.png` });

      await page.goto("/pricing");
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/${size.name}-pricing.png`, fullPage: true });

      await page.goto("/login");
      await settle(page, 400);
      await page.screenshot({ path: `${SHOTS}/${size.name}-login.png` });
    });

    test("free user screens", async ({ page }) => {
      await signIn(page, "free@demo.dev");
      await settle(page);
      await page.screenshot({ path: `${SHOTS}/${size.name}-dashboard-empty.png` });

      await page.goto("/search?what=plumbers&where=Kochi");
      await page.getByRole("button", { name: "Build site" }).first().click();
      await page.waitForURL(/\/build\//);
      await settle(page, 3000);
      await page.screenshot({ path: `${SHOTS}/${size.name}-build.png`, fullPage: true });
    });

    test("pro user screens", async ({ page }) => {
      await signIn(page, "pro@demo.dev");
      await settle(page, 2500);
      await page.screenshot({ path: `${SHOTS}/${size.name}-dashboard-full.png`, fullPage: true });

      await page.getByRole("link", { name: /Bakers|Bakery|Cake/ }).first().click();
      await page.waitForURL(/\/sites\//);
      await settle(page, 2500);
      await page.screenshot({ path: `${SHOTS}/${size.name}-workspace.png` });
      await page.getByRole("radio", { name: "Mobile" }).last().click();
      await settle(page, 2500);
      await page.screenshot({ path: `${SHOTS}/${size.name}-workspace-mobile-preview.png` });
      await page.getByRole("button", { name: "More actions" }).click();
      await page.getByRole("menuitem", { name: "Edit text" }).click();
      await settle(page, 800);
      await page.screenshot({ path: `${SHOTS}/${size.name}-workspace-edit.png` });
    });

    test("generated templates", async ({ page }) => {
      for (const template of ["legacy", "modern", "bold"]) {
        await page.goto(`/api/demo-site?template=${template}`);
        await settle(page, 1500);
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in")));
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${SHOTS}/${size.name}-template-${template}.png`, fullPage: true });
      }
    });
  });
}

test.describe("dark theme", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("key screens in dark", async ({ page, context, baseURL }) => {
    const host = new URL(baseURL ?? "http://localhost:3000").hostname;
    await context.addCookies([{ name: "sf-theme", value: "dark", domain: host, path: "/" }]);
    await page.goto("/");
    await settle(page, 1500);
    await page.screenshot({ path: `${SHOTS}/dark-landing.png` });
    await page.goto("/search?what=salons&where=Bangalore");
    await page.getByRole("button", { name: "Build site" }).first().waitFor();
    await settle(page);
    await page.screenshot({ path: `${SHOTS}/dark-results.png` });
    await signIn(page, "pro@demo.dev");
    await settle(page, 2500);
    await page.screenshot({ path: `${SHOTS}/dark-dashboard.png` });
  });
});
