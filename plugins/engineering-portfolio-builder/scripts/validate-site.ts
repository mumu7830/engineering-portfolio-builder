import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { hasExactCase, resolveInside } from "./lib/paths.js";

export type SiteIssue = { path: string; message: string };

const allowedExtensions = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".woff", ".woff2"]);

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

export function validateSite(siteDir: string, maxAssetBytes = 10 * 1024 * 1024): SiteIssue[] {
  const root = resolve(siteDir);
  const indexPath = join(root, "index.html");
  if (!existsSync(indexPath)) return [{ path: "index.html", message: "Missing root index.html" }];

  const issues: SiteIssue[] = [];
  for (const file of walk(root)) {
    const rel = relative(root, file).replaceAll("\\", "/");
    if (!allowedExtensions.has(extname(file).toLowerCase())) issues.push({ path: rel, message: "Unsupported static MIME extension" });
    if (statSync(file).size > maxAssetBytes) issues.push({ path: rel, message: "Asset exceeds maximum size" });
  }

  const html = readFileSync(indexPath, "utf8");
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:|#|data:)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/, 1)[0].replace(/^\.\//, "").replace(/^\//, "");
    const target = resolveInside(root, clean);
    if (!existsSync(target)) issues.push({ path: clean, message: "Referenced asset is missing" });
    else if (!hasExactCase(target, root)) issues.push({ path: clean, message: "Referenced asset path has incorrect case" });
  }
  return issues;
}

export function assertValidSite(siteDir: string): void {
  const issues = validateSite(siteDir);
  if (issues.length > 0) throw new Error(`Static site validation failed:\n${issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n")}`);
}
