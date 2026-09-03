import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { buildSite } from "../../scripts/build-site.js";
import { templateNames } from "../../scripts/lib/paths.js";

export default async function globalSetup() {
  const repositoryRoot = process.cwd();
  const fixture = join(repositoryRoot, "examples", "fictional-engineer", "portfolio-data.json");
  const outputRoot = join(repositoryRoot, "generated", "browser");
  const mime = new Map([
    [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
    [".svg", "image/svg+xml"], [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".webp", "image/webp"],
  ]);

  await mkdir(outputRoot, { recursive: true });
  for (const template of templateNames) await buildSite({ input: fixture, template, output: join(outputRoot, template) });

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const requested = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    let path = resolve(outputRoot, requested);
    if (!path.startsWith(resolve(outputRoot)) || !existsSync(path)) { response.writeHead(404).end("Not found"); return; }
    if (statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) { response.writeHead(404).end("Not found"); return; }
    response.setHeader("Content-Type", mime.get(extname(path).toLowerCase()) ?? "application/octet-stream");
    createReadStream(path).pipe(response);
  });
  await new Promise<void>((resolveListen) => server.listen(4173, "127.0.0.1", resolveListen));
  return async () => new Promise<void>((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
}
