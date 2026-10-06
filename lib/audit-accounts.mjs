export class AccountError extends Error {
  constructor(code, message, status = 503) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
export function createAuditAccounts(env = process.env, fetcher = fetch) {
  const url = env.SUPABASE_URL;
  const secret = env.SUPABASE_SERVICE_ROLE_KEY;
  const enabled = env.AUDIT_ACCOUNTS_ENABLED === "true" && !!url && !!secret;
  function config() {
    if (!enabled)
      throw new AccountError(
        "AUDIT_NOT_READY",
        "Online audits are not available yet. Contact the team to request an assessment.",
      );
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/"
    )
      throw new AccountError(
        "AUDIT_NOT_READY",
        "Online audits are temporarily unavailable.",
      );
    return parsed.origin;
  }
  async function read(path, options = {}) {
    const response = await fetcher(config() + path, {
      ...options,
      headers: {
        apikey: secret,
        Authorization: "Bearer " + secret,
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: AbortSignal.timeout(7000),
      redirect: "error",
    });
    if (!response.ok)
      throw new AccountError(
        "ACCOUNT_STORE_UNAVAILABLE",
        "We could not verify your audit account. Please try again later.",
      );
    return response.status === 204 ? null : response.json();
  }
  async function rpc(name, body) {
    return read("/rest/v1/rpc/" + name, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  return {
    async requireUser(request) {
      config();
      const auth = request.headers.get("authorization") || "";
      if (!/^Bearer [^\s]{20,8192}$/.test(auth))
        throw new AccountError(
          "SIGN_IN_REQUIRED",
          "Sign in with a verified account to use your free audit.",
          401,
        );
      const response = await fetcher(config() + "/auth/v1/user", {
        headers: { apikey: secret, Authorization: auth },
        signal: AbortSignal.timeout(7000),
        redirect: "error",
      });
      if (response.status === 401 || response.status === 403)
        throw new AccountError(
          "SIGN_IN_REQUIRED",
          "Your session has expired. Please sign in again.",
          401,
        );
      if (!response.ok)
        throw new AccountError(
          "AUTH_UNAVAILABLE",
          "Sign-in verification is temporarily unavailable.",
        );
      const user = await response.json();
      if (
        !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(
          user.id || "",
        ) ||
        !user.email_confirmed_at ||
        !user.email ||
        user.is_anonymous
      )
        throw new AccountError(
          "EMAIL_VERIFICATION_REQUIRED",
          "Verify your email address before running an audit.",
          403,
        );
      return { id: user.id };
    },
    async status(user) {
      const rows = await read(
        "/rest/v1/free_audits?user_id=eq." +
          encodeURIComponent(user.id) +
          "&select=status,report,lease_until",
      );
      if (!Array.isArray(rows))
        throw new AccountError(
          "ACCOUNT_STORE_UNAVAILABLE",
          "Your saved audit could not be read.",
        );
      const row = rows[0];
      if (row?.status === "completed")
        return { state: "completed", report: row.report };
      if (row?.status === "running" && Date.parse(row.lease_until) > Date.now())
        return { state: "running" };
      return { state: "available" };
    },
    async claim(user, jobId) {
      return rpc("claim_free_audit", { p_user_id: user.id, p_job_id: jobId });
    },
    async complete(user, jobId, report) {
      const saved = await rpc("complete_free_audit", {
        p_user_id: user.id,
        p_job_id: jobId,
        p_report: report,
      });
      if (saved !== true)
        throw new AccountError(
          "AUDIT_SAVE_FAILED",
          "The audit could not be saved reliably. Your account status will be checked before another attempt.",
        );
    },
    async fail(user, jobId) {
      return rpc("fail_free_audit", { p_user_id: user.id, p_job_id: jobId });
    },
  };
}
