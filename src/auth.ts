import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
export async function getAuditAuth() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (
    import.meta.env.VITE_AUDIT_ENABLED !== "true" ||
    !url ||
    !key ||
    typeof window === "undefined"
  )
    return null;
  if (!client) {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(url, key, {
      auth: {
        storage: window.sessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}
