import { readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

export const templateNames = ["tech-dark", "professional-light", "creative-visual"] as const;
export type TemplateName = (typeof templateNames)[number];

export function normalizeTemplateName(value: string): TemplateName {
  if (!templateNames.includes(value as TemplateName)) {
    throw new Error(`Unknown template: ${value}. Expected one of ${templateNames.join(", ")}.`);
  }
  return value as TemplateName;
}

export function resolveInside(base: string, candidate: string): string {
  const root = resolve(base);
  const target = resolve(root, candidate);
  const relation = relative(root, target);
  if (relation === ".." || relation.startsWith(`..${sep}`) || relation.includes(`..${sep}`)) {
    throw new Error(`Path traversal outside the allowed directory: ${candidate}`);
  }
  return target;
}

export function hasExactCase(path: string, root: string): boolean {
  const relation = relative(resolve(root), resolve(path));
  if (relation.startsWith("..")) return false;
  let current = resolve(root);
  for (const segment of relation.split(sep).filter(Boolean)) {
    const match = readdirSync(current).find((entry) => entry === segment);
    if (!match) return false;
    current = resolve(current, match);
  }
  return true;
}
