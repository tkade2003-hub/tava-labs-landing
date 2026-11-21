import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tava Labs Supabase project (the Rork project, ref vuzrpgkqytzvbbxwsvqr).
// The anon key is the public client key, safe to ship in client code. All
// account data is served server-side by the web-account edge function
// (service role, keyed by the verified email in the session token); the
// browser never reads the tables directly.
export const SUPABASE_URL = "https://vuzrpgkqytzvbbxwsvqr.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1enJwZ2txeXR6dmJieHdzdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2OTg0OTEsImV4cCI6MjExMDI3NDQ5MX0.edxg3NtlsxkvGo58_MBalpcQufQB7t0oy1k-YkGHfnw";

export const WEB_ACCOUNT_URL = `${SUPABASE_URL}/functions/v1/web-account`;
export const FUNNEL_INTAKE_URL = `${SUPABASE_URL}/functions/v1/funnel-intake`;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
