import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vitestEntry = path.join(repoRoot, "node_modules", "vitest", "vitest.mjs");
const result = spawnSync(
  process.execPath,
  [
    vitestEntry,
    "run",
    "--exclude",
    ".worktrees/**",
    "--exclude",
    "plugins/engineering-portfolio-builder/tests/browser/**",
  ],
  { cwd: repoRoot, encoding: "utf8" },
);

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
