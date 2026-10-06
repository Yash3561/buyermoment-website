import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHandler } from "../api/check.js";
const api = createHandler();
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
        const file =
          url.pathname === "/"
            ? "dist/index.html"
            : "dist" + url.pathname + "/index.html";
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(await readFile(file));
        return;
      }
      const base = resolve("dist");
      const file = resolve(base, "." + decodeURIComponent(url.pathname));
      if (!file.startsWith(base + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type":
          types[file.slice(file.lastIndexOf("."))] ||
          "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Artifact QA preview: http://127.0.0.1:4173"),
  );
