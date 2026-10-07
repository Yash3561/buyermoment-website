import type { SupabaseClient } from "@supabase/supabase-js";

let clientPromise: Promise<SupabaseClient> | null = null;
export const privateAuditAuthConfigured =
  !!import.meta.env.VITE_SUPABASE_URL &&
  !!(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
export const auditAuthConfigured =
  import.meta.env.VITE_AUDIT_ENABLED === "true" && privateAuditAuthConfigured;
export const googleAuthEnabled =
  import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";

export async function getAuditAuth(privateTest = false) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  // This permits sign-in only. Audit access is enforced by the server's verified-ID gate.
  if (
    !(privateTest ? privateAuditAuthConfigured : auditAuthConfigured) ||
    typeof window === "undefined"
  )
    return null;
  // StrictMode and concurrent callers must share the same PKCE verifier/client.
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) =>
        createClient(url, key, {
          auth: {
            storage: window.sessionStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: "pkce",
          },
        }),
      )
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}
