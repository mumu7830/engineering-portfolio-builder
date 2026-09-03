import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { redactValue, scanText, type PrivacyIssue } from "./lib/privacy.js";

const ignoredDirectories = new Set([
  ".git",
  ".tools",
  ".worktrees",
  "node_modules",
  "dist",
  "generated",
  "coverage",
]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

export async function scanPath(rootPath: string): Promise<PrivacyIssue[]> {
  const absoluteRoot = resolve(rootPath);
  const issues: PrivacyIssue[] = [];

  async function visit(path: string): Promise<void> {
    const entries = await readdir(path, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolute = join(path, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (textExtensions.has(extname(entry.name).toLowerCase())) {
        const text = await readFile(absolute, "utf8");
        issues.push(...scanText(text, absolute.slice(absoluteRoot.length + 1)));
      }
    }
  }

  await visit(absoluteRoot);
  return issues;
}

if (process.argv[1]?.endsWith("scan-privacy.ts")) {
  const root = process.argv[2] ?? ".";
  const issues = await scanPath(root);
  if (issues.length === 0) {
    console.log(`Privacy scan passed: ${resolve(root)}`);
  } else {
    for (const issue of issues) {
      console.error(
        `${issue.kind}: ${issue.location ?? "unknown"}: ${redactValue(issue.value)}`,
      );
    }
    process.exitCode = 1;
  }
}
