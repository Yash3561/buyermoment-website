import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { createHandler } from "../api/check.js";
const port = Number(process.argv[2] || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Choose a local preview port between 1024 and 65535.");
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
      const url = new URL(req.url, "http://127.0.0.1:" + port);
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
      const path = url.pathname.replace(/\/+$/, "") || "/";
      if (
        [
          "/",
          "/audit",
          "/book",
          "/sample-report",
          "/methodology",
          "/privacy",
          "/terms",
        ].includes(path)
      ) {
        const file =
          path === "/" ? "dist/index.html" : "dist" + path + "/index.html";
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
  .listen(port, "127.0.0.1", () =>
    console.log("Artifact QA preview: http://127.0.0.1:" + port),
  );
