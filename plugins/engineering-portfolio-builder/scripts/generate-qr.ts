import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";

const decodeQr = jsQR as unknown as (
  data: Uint8ClampedArray,
  width: number,
  height: number,
) => { data: string } | null;

export async function generateVerifiedQr(url: string, outputPath: string): Promise<{ outputPath: string; decodedValue: string }> {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("QR target must be an HTTP or HTTPS URL.");
  const target = resolve(outputPath);
  await mkdir(dirname(target), { recursive: true });
  await QRCode.toFile(target, url, {
    errorCorrectionLevel: "H",
    margin: 4,
    width: 512,
    color: { dark: "#071d37", light: "#ffffff" },
  });

  const png = PNG.sync.read(await readFile(target));
  const decoded = decodeQr(new Uint8ClampedArray(png.data), png.width, png.height);
  if (!decoded || decoded.data !== url) {
    throw new Error(`QR decode verification failed for ${target}.`);
  }
  return { outputPath: target, decodedValue: decoded.data };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [url, outputPath] = process.argv.slice(2);
  if (!url || !outputPath) throw new Error("Usage: generate-qr <public-url> <output.png>");
  process.stdout.write(`${JSON.stringify(await generateVerifiedQr(url, outputPath))}\n`);
}
