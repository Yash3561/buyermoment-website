// Read-only launch diagnostics. Never sends email, creates users or starts scans.
import { pathToFileURL } from "node:url";

const productionHosts = new Set([
  "www.contextlumen.com",
  "contextlumen.com",
  "motivory.vercel.app",
]);

export async function auditLaunchPreflight(
  base = "https://www.contextlumen.com",
  fetcher = fetch,
) {
  const origin = new URL(base);
  if (
    origin.protocol !== "https:" ||
    !productionHosts.has(origin.hostname) ||
    origin.port ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  )
    throw new Error(
      "Use a ContextLumen production origin without a path or credentials.",
    );

  const checks = [];
  for (const path of ["/audit", "/methodology", "/privacy", "/terms"]) {
    const response = await fetcher(origin.origin + path, {
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    checks.push({
      check: path,
      pass:
        response.status === 200 &&
        (response.headers.get("content-type") || "").includes("text/html") &&
        html.includes("ContextLumen") &&
        html.includes("<h1"),
      detail: "HTTP " + response.status,
    });
    if (path === "/audit")
      checks.push({
        check: "Self-service sign-in enabled",
        pass:
          !html.includes("Your audit is being prepared.") &&
          (html.includes("Preparing secure sign-in") ||
            html.includes("Send a sign-in code")),
        detail: html.includes("Your audit is being prepared.")
          ? "Frontend is still in pre-launch mode"
          : "Check the sign-in form in a browser",
      });
  }
  const api = await fetcher(origin.origin + "/api/check", {
    headers: { Accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const jsonType = (api.headers.get("content-type") || "").includes(
    "application/json",
  );
  let payload = {};
  if (jsonType) {
    try {
      payload = await api.json();
    } catch {
      /* Invalid JSON fails below. */
    }
  }
  checks.push({
    check: "Audit API configured and requires sign-in",
    pass: api.status === 401 && payload.code === "SIGN_IN_REQUIRED",
    detail:
      "HTTP " +
      api.status +
      (typeof payload.code === "string" && /^[A-Z_]{1,64}$/.test(payload.code)
        ? " / " + payload.code
        : ""),
  });
  return checks;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const checks = await auditLaunchPreflight(process.env.AUDIT_BASE_URL);
    for (const item of checks)
      console.log(
        `${item.pass ? "PASS" : "FAIL"} ${item.check}: ${item.detail}`,
      );
    console.log(
      "These read-only checks do not verify SMTP delivery, successful sign-in, saved reports or account isolation. Complete the live acceptance checks before announcing launch.",
    );
    if (checks.some((item) => !item.pass)) process.exitCode = 1;
  } catch {
    console.error(
      "FAIL Launch diagnostics could not reach or validate the configured ContextLumen deployment.",
    );
    process.exitCode = 1;
  }
}
