import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runnerEntry = path.join(repoRoot, "scripts", "run-unit-tests.mjs");
const result = spawnSync(process.execPath, [runnerEntry], {
  cwd: repoRoot,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

process.stdout.write("Vitest excludes the Playwright browser suite.\n");
