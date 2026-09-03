import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("public plugin repository", () => {
  test("contains the required plugin and marketplace manifests", () => {
    expect(existsSync(".agents/plugins/marketplace.json")).toBe(true);
    expect(
      existsSync(
        "plugins/engineering-portfolio-builder/.codex-plugin/plugin.json",
      ),
    ).toBe(true);
  });

  test("ignores every private working artifact", () => {
    const ignore = readFileSync(".gitignore", "utf8");
    for (const entry of [
      "input/",
      "private/",
      "generated/",
      "dist/",
      "*.zip",
      ".env*",
    ]) {
      expect(ignore).toContain(entry);
    }
  });
});
