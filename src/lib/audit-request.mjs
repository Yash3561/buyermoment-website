// Read-only status recovery and collection share one response contract.
export class AuditRequestError extends Error {
  constructor(message, code, status = 0) {
    super(message);
    this.name = "AuditRequestError";
    this.code = code;
    this.status = status;
  }
}

const messages = {
  SIGN_IN_REQUIRED:
    "Your session has expired. Sign in again to access your saved audit.",
  EMAIL_VERIFICATION_REQUIRED:
    "Verify your email address before requesting an audit.",
  AUDIT_IN_PROGRESS:
    "Your audit is still running. Check your saved audit status instead of starting another scan.",
  FREE_AUDIT_USED:
    "Your free audit has already been used. Check your account to open the saved report.",
  AUDIT_SAVE_FAILED:
    "We could not confirm that the report was saved. Check your account status before trying another scan.",
  DNS_FAILED:
    "We could not find this website. Check the domain spelling and try again.",
  TIMEOUT:
    "The website check took too long. Check your saved audit status before trying again.",
};

export async function requestAudit({
  accessToken,
  website,
  signal,
  fetchImpl = fetch,
}) {
  let response;
  try {
    response = await fetchImpl("/api/check", {
      method: website === undefined ? "GET" : "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        ...(website === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      ...(website === undefined
        ? {}
        : { body: JSON.stringify({ url: website.trim() }) }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted || ["AbortError", "TimeoutError"].includes(error?.name))
      throw new AuditRequestError(
        "The request timed out. The server may still finish your audit. Check your saved audit status before trying another scan.",
        "REQUEST_TIMEOUT",
      );
    throw new AuditRequestError(
      "We lost the connection before confirming the result. Check your saved audit status before trying another scan.",
      "CONNECTION_UNCONFIRMED",
    );
  }
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new AuditRequestError(
      "Online audits are unavailable on this deployment. Your account has not been confirmed. Please contact the team.",
      "INVALID_RESPONSE",
      response.status,
    );
  let result;
  try {
    result = await response.json();
  } catch {
    throw new AuditRequestError(
      "We could not read the response. Check your saved audit status before trying again.",
      "INVALID_RESPONSE",
      response.status,
    );
  }
  if (!response.ok) {
    const code =
      typeof result?.code === "string" ? result.code : "REQUEST_FAILED";
    // These messages originate from our validated backend, not a provider error body.
    const fallback =
      typeof result?.error === "string" && result.error.length <= 500
        ? result.error
        : "We could not complete this request. Check your account or contact the team.";
    throw new AuditRequestError(
      messages[code] ||
        (response.status === 401
          ? messages.SIGN_IN_REQUIRED
          : response.status === 429
            ? "Several requests were made recently. Please wait before trying again. Your saved report is unchanged."
            : fallback),
      response.status === 401 ? "SIGN_IN_REQUIRED" : code,
      response.status,
    );
  }
  return result;
}
