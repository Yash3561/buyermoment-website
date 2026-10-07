export function signInErrorMessage(error, verifying = false) {
  if (
    error?.status === 429 ||
    ["over_request_rate_limit", "over_email_send_rate_limit"].includes(
      error?.code,
    )
  )
    return "Too many attempts. Wait a minute before trying again or requesting a new code.";
  if (verifying && error?.code === "otp_expired")
    return "That code is incorrect, expired, or already used. Check the newest eight-digit code in your inbox, or request a new code.";
  return verifying
    ? "We could not verify that code. Check the newest code or request a new one."
    : "We could not send a sign-in code. Please wait a minute and try again, or contact us.";
}

// The callback is fixed to this app. Never accept a visitor-supplied return URL.
export function googleSignInOptions(origin) {
  const url = new URL(origin);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    )
  )
    throw new Error("Secure sign-in requires HTTPS.");
  if (url.username || url.password) throw new Error("Invalid sign-in origin.");
  return { provider: "google", options: { redirectTo: url.origin + "/audit" } };
}

export function authReturnState(href) {
  const url = new URL(href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const failed = [url.searchParams, hash].some(
    (params) =>
      params.has("error") ||
      params.has("error_code") ||
      params.has("error_description"),
  );
  const hasCode = url.searchParams.has("code");
  for (const key of ["code", "error", "error_code", "error_description"])
    url.searchParams.delete(key);
  // Supabase owns OAuth fragments. Remove credentials/errors without displaying them.
  if (
    [
      "access_token",
      "refresh_token",
      "error",
      "error_code",
      "error_description",
    ].some((key) => hash.has(key))
  )
    url.hash = "";
  return { failed, hasCode, cleanPath: url.pathname + url.search + url.hash };
}

export function isReadinessReport(value) {
  if (!value || typeof value !== "object") return false;
  const https = (input) => {
    try {
      const url = new URL(input);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  };
  const text = (input) => typeof input === "string";
  const count = (input) => Number.isInteger(input) && input >= 0;
  return Boolean(
    text(value.version) &&
    text(value.scope) &&
    text(value.checkedAt) &&
    Number.isFinite(Date.parse(value.checkedAt)) &&
    https(value.requestedUrl) &&
    https(value.finalUrl) &&
    typeof value.cached === "boolean" &&
    value.evidence &&
    https(value.evidence.robotsUrl) &&
    count(value.evidence.robotsStatus) &&
    Array.isArray(value.evidence.redirects) &&
    value.evidence.redirects.every(
      (hop) => hop && https(hop.url) && count(hop.status),
    ) &&
    value.training &&
    text(value.training.agent) &&
    text(value.training.note) &&
    typeof value.training.allowedByRobots === "boolean" &&
    Array.isArray(value.limitations) &&
    value.limitations.every(text) &&
    Array.isArray(value.findings) &&
    value.findings.length > 0 &&
    value.findings.every(
      (f) =>
        f &&
        [f.id, f.title, f.evidence, f.meaning, f.action].every(text) &&
        ["observed", "review", "note"].includes(f.status) &&
        count(f.priority) &&
        https(f.source),
    ) &&
    new Set(value.findings.map((f) => f.id)).size === value.findings.length &&
    value.summary &&
    ["total", "observed", "review", "notes"].every((key) =>
      count(value.summary[key]),
    ) &&
    value.summary.total === value.findings.length &&
    value.summary.observed ===
      value.findings.filter((f) => f.status === "observed").length &&
    value.summary.review ===
      value.findings.filter((f) => f.status === "review").length &&
    value.summary.notes ===
      value.findings.filter((f) => f.status === "note").length,
  );
}
