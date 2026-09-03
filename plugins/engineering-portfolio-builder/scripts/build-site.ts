import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import { validatePortfolioData } from "./lib/schema.js";
import { normalizeTemplateName, resolveInside, type TemplateName } from "./lib/paths.js";
import { assertValidSite } from "./validate-site.js";

const modulePluginRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginRoot = existsSync(join(modulePluginRoot, "assets", "templates"))
  ? modulePluginRoot
  : resolve(process.cwd(), "plugins", "engineering-portfolio-builder");
const templatesRoot = join(pluginRoot, "assets", "templates");

export async function buildSite(options: {
  input: string;
  template: TemplateName;
  output: string;
}): Promise<{ outputDir: string; indexPath: string }> {
  const template = normalizeTemplateName(options.template);
  const inputPath = resolve(options.input);
  const inputRoot = dirname(inputPath);
  const parsed = validatePortfolioData(JSON.parse(await readFile(inputPath, "utf8")));
  if (!parsed.success) throw new Error(`Portfolio data is invalid:\n${parsed.issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n")}`);

  const temporaryParent = join(pluginRoot, ".tmp");
  await mkdir(temporaryParent, { recursive: true });
  const temporaryRoot = await mkdtemp(join(temporaryParent, "build-"));
  const tempTemplates = join(temporaryRoot, "templates");
  const tempTemplate = join(tempTemplates, template);
  const outputDir = resolve(options.output);

  try {
    await mkdir(tempTemplates, { recursive: true });
    await cp(join(templatesRoot, "shared"), join(tempTemplates, "shared"), { recursive: true });
    await cp(join(templatesRoot, template), tempTemplate, { recursive: true, filter: (source) => !source.endsWith(`${join(template, "dist")}`) });
    await mkdir(join(tempTemplate, "src", "generated"), { recursive: true });
    await writeFile(join(tempTemplate, "src", "generated", "portfolio-data.json"), `${JSON.stringify(parsed.data, null, 2)}\n`, "utf8");

    for (const asset of parsed.data.media.filter((media) => media.publicationApproved)) {
      const source = resolveInside(inputRoot, asset.path);
      const destination = resolveInside(join(tempTemplate, "public"), asset.path);
      await mkdir(dirname(destination), { recursive: true });
      await cp(source, destination);
    }

    await build({
      root: tempTemplate,
      configFile: false,
      base: "./",
      plugins: [react()],
      logLevel: "silent",
      build: { outDir: outputDir, emptyOutDir: true },
    });
    assertValidSite(outputDir);
    return { outputDir, indexPath: join(outputDir, "index.html") };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = readFlag("input");
  const template = readFlag("template");
  const output = readFlag("output");
  if (!input || !template || !output) throw new Error("Usage: build-site --input <json> --template <name> --output <directory>");
  const result = await buildSite({ input, template: normalizeTemplateName(template), output });
  process.stdout.write(`${result.outputDir}\n`);
}
