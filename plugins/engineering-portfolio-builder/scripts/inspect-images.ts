import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export type ImageInput = {
  path: string;
  alt: string;
  crop?: { left: number; top: number; width: number; height: number };
};

export type ImageIssue = {
  path: string;
  kind: "missing" | "too-small" | "extreme-aspect" | "invalid-crop" | "missing-alt";
  message: string;
};

export async function inspectImages(images: ImageInput[]): Promise<ImageIssue[]> {
  const issues: ImageIssue[] = [];
  for (const image of images) {
    if (!image.alt.trim()) issues.push({ path: image.path, kind: "missing-alt", message: "Image alternative text is required." });
    try {
      const metadata = await sharp(image.path).metadata();
      const width = metadata.width ?? 0;
      const height = metadata.height ?? 0;
      if (width < 640 || height < 360) issues.push({ path: image.path, kind: "too-small", message: `Image is ${width}×${height}; use a clearer source instead of upscaling.` });
      if (width > 0 && height > 0 && (width / height > 5 || width / height < 0.2)) issues.push({ path: image.path, kind: "extreme-aspect", message: "Image aspect ratio is too extreme for a project figure." });
      if (image.crop && (image.crop.left + image.crop.width > width || image.crop.top + image.crop.height > height)) {
        issues.push({ path: image.path, kind: "invalid-crop", message: "Explicit crop coordinates exceed the source image bounds." });
      }
    } catch {
      issues.push({ path: image.path, kind: "missing", message: "Image is missing or unreadable." });
    }
  }
  return issues;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const issues = await inspectImages(process.argv.slice(2).map((path) => ({ path, alt: path })));
  process.stdout.write(`${JSON.stringify(issues, null, 2)}\n`);
  if (issues.length > 0) process.exitCode = 1;
}
