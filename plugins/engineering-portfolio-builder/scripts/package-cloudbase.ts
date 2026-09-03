import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";
import { assertValidSite } from "./validate-site.js";

export const cloudBaseStaticHosting = {
  installCommand: null,
  buildCommand: null,
  outputDirectory: "./",
  route: "/",
} as const;

export async function packageCloudBase(options: { siteDir: string; outputFile: string }): Promise<string> {
  const siteDir = resolve(options.siteDir);
  const outputFile = resolve(options.outputFile);
  assertValidSite(siteDir);
  await mkdir(dirname(outputFile), { recursive: true });
  const archive = new AdmZip();
  archive.addLocalFolder(siteDir);
  archive.writeZip(outputFile);
  return outputFile;
}

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const siteDir = readFlag("site");
  const outputFile = readFlag("output");
  if (!siteDir || !outputFile) throw new Error("Usage: package-cloudbase --site <directory> --output <zip>");
  process.stdout.write(`${await packageCloudBase({ siteDir, outputFile })}\n`);
}
