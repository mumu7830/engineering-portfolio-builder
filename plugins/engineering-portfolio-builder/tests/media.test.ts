import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { generateVerifiedQr } from "../scripts/generate-qr.js";
import { inspectImages } from "../scripts/inspect-images.js";

let work = "";
beforeAll(async () => {
  work = await mkdtemp(join(tmpdir(), "portfolio-media-"));
  await sharp({ create: { width: 180, height: 120, channels: 3, background: "#5078a8" } }).png().toFile(join(work, "small.png"));
  await sharp({ create: { width: 1400, height: 120, channels: 3, background: "#5078a8" } }).png().toFile(join(work, "wide.png"));
});
afterAll(async () => { if (work) await rm(work, { recursive: true, force: true }); });

describe("image quality inspection", () => {
  test("reports missing, undersized, and extreme-aspect assets", async () => {
    const issues = await inspectImages([
      { path: join(work, "missing.png"), alt: "missing" },
      { path: join(work, "small.png"), alt: "small" },
      { path: join(work, "wide.png"), alt: "wide" },
    ]);

    expect(issues.map((issue) => issue.kind)).toEqual(expect.arrayContaining(["missing", "too-small", "extreme-aspect"]));
  });
});

describe("verified QR generation", () => {
  test("writes a QR that decodes byte-for-byte to the requested URL", async () => {
    const url = "https://portfolio.example.com/engineer/";
    const output = join(work, "portfolio-qr.png");
    const result = await generateVerifiedQr(url, output);
    const png = PNG.sync.read(await readFile(output));
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);

    expect(result.decodedValue).toBe(url);
    expect(decoded?.data).toBe(url);
  });
});
