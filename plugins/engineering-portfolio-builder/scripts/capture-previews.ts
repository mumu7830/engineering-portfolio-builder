import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import globalSetup from "../tests/browser/global-setup.js";
import { templateNames } from "./lib/paths.js";

const teardown = await globalSetup();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await mkdir(join(process.cwd(), "docs", "images"), { recursive: true });
  for (const template of templateNames) {
    await page.goto(`http://127.0.0.1:4173/${template}/`);
    await page.locator(".loading-mark").waitFor({ state: "hidden" });
    await page.screenshot({ path: join(process.cwd(), "docs", "images", `${template}.png`), fullPage: false });
  }
} finally {
  await browser.close();
  await teardown();
}
