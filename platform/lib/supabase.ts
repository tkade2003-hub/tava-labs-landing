import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tava Labs Supabase project (his own, ref evzfibetybqhwikwhfbd). The
// anon key is the public client key — the same one pinned in the mobile
// app's Config.swift. All account data is served server-side by the
// web-account edge function (service role, keyed by verified email);
// the browser never reads the tables directly (RLS is Rork-sub based).
export const SUPABASE_URL = "https://evzfibetybqhwikwhfbd.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2emZpYmV0eWJxaHdpa3doZmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4NjI1NzksImV4cCI6MjExMDQzODU3OX0.TVUI_YRewzV5OrdZIyz-XgdAQOOc_uK_X7eE7uL5XWI";

export const WEB_ACCOUNT_URL = `${SUPABASE_URL}/functions/v1/web-account`;
export const FUNNEL_INTAKE_URL = `${SUPABASE_URL}/functions/v1/funnel-intake`;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!client) client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
