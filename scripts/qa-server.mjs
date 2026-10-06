import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { render } from "../.qa/entry-server.js";
import { createHandler } from "../api/check.js";
const api = createHandler();
const template = (await readFile("index.html", "utf8"))
  .replace('<div id="root"></div>', () => '<div id="root">__RENDER__</div>')
  .replace(
    '<script type="module" src="/src/main.tsx"></script>',
    '<link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script>',
  );
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain",
  ".xml": "application/xml",
};
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://127.0.0.1:4173");
      if (url.pathname === "/api/check") {
        let size = 0;
        const chunks = [];
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 2048) {
            res.writeHead(413);
            res.end();
            return;
          }
          chunks.push(chunk);
        }
        const response = await api(
          new Request(url, {
            method: req.method,
            headers: req.headers,
            ...(req.method !== "GET" && req.method !== "HEAD"
              ? { body: Buffer.concat(chunks) }
              : {}),
          }),
        );
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      if (["/", "/audit", "/book"].includes(url.pathname)) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(template.replace("__RENDER__", () => render(url.pathname)));
        return;
      }
      const base = resolve(
        url.pathname.startsWith("/assets/") ? ".qa" : "public",
      );
      const file = resolve(base, "." + decodeURIComponent(url.pathname));
      if (!file.startsWith(base + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const body = await readFile(file);
      const extension = file.slice(file.lastIndexOf("."));
      res.writeHead(200, {
        "Content-Type": types[extension] || "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Source QA preview: http://127.0.0.1:4173"),
  );
