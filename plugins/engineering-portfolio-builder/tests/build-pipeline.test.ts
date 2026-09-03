import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AdmZip from "adm-zip";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { buildSite } from "../scripts/build-site.js";
import { packageCloudBase } from "../scripts/package-cloudbase.js";
import { normalizeTemplateName } from "../scripts/lib/paths.js";

let work = "";
const fixture = join(process.cwd(), "examples", "fictional-engineer", "portfolio-data.json");

beforeAll(async () => { work = await mkdtemp(join(tmpdir(), "portfolio-build-")); });
afterAll(async () => { if (work) await rm(work, { recursive: true, force: true }); });

describe("site build pipeline", () => {
  test.each(["tech-dark", "professional-light", "creative-visual"])("accepts template %s", (name) => {
    expect(normalizeTemplateName(name)).toBe(name);
  });

  test("rejects an unknown template", () => {
    expect(() => normalizeTemplateName("generic-blue")).toThrow(/unknown template/i);
  });

  test("rejects media paths that escape the input directory", async () => {
    const unsafeInput = join(work, "unsafe.json");
    const data = JSON.parse(await readFile(fixture, "utf8"));
    data.media[0].path = "../private.png";
    await writeFile(unsafeInput, JSON.stringify(data), "utf8");

    await expect(buildSite({ input: unsafeInput, template: "tech-dark", output: join(work, "unsafe-out") }))
      .rejects.toThrow(/outside|traversal/i);
  });

  test("builds a valid static site and packages root entries for CloudBase", async () => {
    const output = join(work, "site");
    const result = await buildSite({ input: fixture, template: "tech-dark", output });
    expect(await readFile(result.indexPath, "utf8")).toContain('<div id="root"></div>');

    const zipPath = await packageCloudBase({ siteDir: output, outputFile: join(work, "site-cloudbase.zip") });
    const entries = new AdmZip(zipPath).getEntries().map((entry) => entry.entryName);
    expect(entries).toContain("index.html");
    expect(entries.some((entry) => entry.startsWith("assets/"))).toBe(true);
    expect(entries.some((entry) => entry.startsWith("site/"))).toBe(false);
  }, 30_000);
});
