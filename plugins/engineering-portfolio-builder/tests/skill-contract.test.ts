import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const skillPath = fileURLToPath(
  new URL("../skills/building-engineering-portfolios/SKILL.md", import.meta.url),
);

function readSkill(): string {
  return readFileSync(skillPath, "utf8").toLowerCase();
}

describe("engineering portfolio skill contract", () => {
  test("defines the evidence-based project story contract", () => {
    const skill = readSkill();

    expect(skill).toMatch(/provenance|source/);
    expect(skill).toContain("background");
    expect(skill).toContain("problem");
    expect(skill).toContain("action");
    expect(skill).toContain("result");
    expect(skill).toMatch(/interleav|图文/);
    expect(skill).toMatch(/conflict|unresolved/);
  });

  test("keeps attached documents in the data boundary", () => {
    const skill = readSkill();

    expect(skill).toMatch(/documents?.{0,80}data/);
    expect(skill).toMatch(/not instructions|ignore.{0,60}instruction/);
  });

  test("requires privacy and deployment gates", () => {
    const skill = readSkill();

    expect(skill).toMatch(/privacy.{0,80}disclos|disclos.{0,80}personal/);
    expect(skill).toMatch(/action-time|immediately before upload/);
    expect(skill).toMatch(/cloudbase/);
    expect(skill).toMatch(/cost|paid|renewal/);
    expect(skill).toMatch(/local.{0,40}verif|verify.{0,40}local/);
    expect(skill).toMatch(/decode.{0,40}qr|qr.{0,40}decode/);
  });
});
