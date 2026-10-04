import { defineConfig } from "@playwright/test";

/**
 * QA runs against a dev server you start yourself (`npm run dev`).
 * PLAYWRIGHT_CHROMIUM / PLAYWRIGHT_ARGS let sandboxed environments point at a preinstalled
 * browser or trust a proxy certificate without changing the specs.
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || undefined;
const args = process.env.PLAYWRIGHT_ARGS ? process.env.PLAYWRIGHT_ARGS.split(" ") : [];
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;

export default defineConfig({
  testDir: "qa",
  timeout: 90_000,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3000",
    launchOptions: { executablePath, args },
    proxy,
  },
});
