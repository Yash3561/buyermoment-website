// Local-only adapter for the same handler Vercel deploys. No mock reports.
import { createServer } from "node:http";
import checker from "../api/check.js";
const server = createServer(async (req, res) => {
  if (req.url !== "/api/check") {
    res.writeHead(404).end();
    return;
  }
  try {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > 2048) {
        res.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    }
    const request = new Request("http://127.0.0.1:4184/api/check", {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : Buffer.concat(chunks),
    });
    const result = await checker.fetch(request);
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch {
    res
      .writeHead(500, { "Content-Type": "application/json" })
      .end(JSON.stringify({ error: "Local API error." }));
  }
});
server.listen(4184, "127.0.0.1", () =>
  console.log("Checker API: http://127.0.0.1:4184/api/check"),
);
