import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AdmZip from "adm-zip";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import fixture from "../../../examples/fictional-engineer/portfolio-data.json";
import { buildSite } from "../scripts/build-site.js";
import { generateVerifiedQr } from "../scripts/generate-qr.js";
import { templateNames } from "../scripts/lib/paths.js";
import { scanText } from "../scripts/lib/privacy.js";
import { validatePortfolioData } from "../scripts/lib/schema.js";
import { packageCloudBase } from "../scripts/package-cloudbase.js";
import { validateSite } from "../scripts/validate-site.js";

let work = "";
const input = join(process.cwd(), "examples", "fictional-engineer", "portfolio-data.json");
beforeAll(async () => { work = await mkdtemp(join(tmpdir(), "portfolio-e2e-")); });
afterAll(async () => { if (work) await rm(work, { recursive: true, force: true }); });

describe("fictional engineer end-to-end workflow", () => {
  test("validates, renders three previews, packages CloudBase, and verifies QR", async () => {
    expect(validatePortfolioData(fixture).success).toBe(true);

    for (const template of templateNames) {
      const output = join(work, template);
      await buildSite({ input, template, output });
      expect(validateSite(output)).toEqual([]);
      for (const file of await readdir(join(output, "assets"))) {
        const content = await readFile(join(output, "assets", file), "utf8");
        expect(scanText(content).filter((issue) => issue.blocked)).toEqual([]);
      }
    }

    const zipPath = await packageCloudBase({ siteDir: join(work, "tech-dark"), outputFile: join(work, "fictional-cloudbase.zip") });
    expect(new AdmZip(zipPath).getEntry("index.html")).not.toBeNull();
    const qr = await generateVerifiedQr("https://portfolio.example.com/fictional-engineer/", join(work, "public-url.png"));
    expect(qr.decodedValue).toBe("https://portfolio.example.com/fictional-engineer/");
  }, 30_000);

  test("repository exposes reproducible validation commands", async () => {
    const packageJson = JSON.parse(await readFile(join(process.cwd(), "package.json"), "utf8"));
    expect(packageJson.scripts).toMatchObject({ validate: expect.any(String), "test:unit": expect.any(String), "test:browser": expect.any(String) });
  });
});
