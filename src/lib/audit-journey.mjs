export function normalizeWebsite(value) {
  const text = String(value || "").trim();
  if (!text || text.length > 500)
    throw new Error("Enter your public website, such as yourbusiness.com.");
  let url;
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:/i.test(text) ? text : "https://" + text);
  } catch {
    throw new Error("Enter a valid public website address.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    /(^localhost$|\.local$|\.internal$)/i.test(url.hostname) ||
    /^[\d.]+$/.test(url.hostname) ||
    url.hostname.includes(":")
  )
    throw new Error(
      "Use a public website without credentials or a custom port.",
    );
  return "https://" + url.hostname.toLowerCase() + "/";
}
export const cleanOtp = (value) => String(value).replace(/\D/g, "").slice(0, 8);
// A scan intent is in-memory only, consumed before POST. Refresh and OAuth returns
// restore the website, never permission to spend the account's allowance.
export function consumeScanIntent(intent, accountState, accountId) {
  if (!intent || accountState !== "available" || intent.accountId !== accountId)
    return null;
  const website = intent.website;
  intent.website = "";
  return website || null;
}
export const websiteStorageKey = "contextlumen-audit-website";
