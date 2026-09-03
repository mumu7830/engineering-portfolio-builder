import { expect, test } from "@playwright/test";
import { portfolioViewports, templateNames } from "./viewports.js";

for (const template of templateNames) {
  for (const viewport of portfolioViewports) {
    test(`${template} is responsive at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/${template}/`);

      await expect(page.getByRole("heading", { name: "精选项目" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "让结构方案进入下一步" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      const projectButton = page.locator('button[aria-controls="sorting-cell-story"]');
      await projectButton.focus();
      await page.keyboard.press("Enter");
      await expect(projectButton).toHaveAttribute("aria-expanded", "true");

      const detailButtons = page.locator("button.detail-toggle");
      for (let index = 0; index < await detailButtons.count(); index += 1) {
        if (await detailButtons.nth(index).getAttribute("aria-expanded") === "false") await detailButtons.nth(index).click();
      }
      const images = page.locator("img");
      for (let index = 0; index < await images.count(); index += 1) {
        await images.nth(index).scrollIntoViewIfNeeded();
        await expect.poll(() => images.nth(index).evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      }
    });
  }

  test(`${template} honors reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${template}/`);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const duration = await page.locator(".loading-mark").evaluate((element) => getComputedStyle(element).animationDuration);
    expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
  });
}
