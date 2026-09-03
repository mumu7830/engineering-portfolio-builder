import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./plugins/engineering-portfolio-builder/tests/browser",
  globalSetup: "./plugins/engineering-portfolio-builder/tests/browser/global-setup.ts",
  timeout: 30_000,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
  },
});
