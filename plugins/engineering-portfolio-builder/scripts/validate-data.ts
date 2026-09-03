import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validatePortfolioData } from "./lib/schema.js";

export async function validateDataFile(path: string) {
  const absolute = resolve(path);
  const input = JSON.parse(await readFile(absolute, "utf8")) as unknown;
  return validatePortfolioData(input);
}

if (process.argv[1]?.endsWith("validate-data.ts")) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: validate-data <portfolio-data.json>");
    process.exitCode = 2;
  } else {
    const result = await validateDataFile(inputPath);
    if (!result.success) {
      for (const issue of result.issues) {
        console.error(`${issue.severity}: ${issue.path}: ${issue.message}`);
      }
      process.exitCode = 1;
    } else {
      console.log(`Valid portfolio data: ${resolve(inputPath)}`);
    }
  }
}
