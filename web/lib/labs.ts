import { supabase, SUPABASE_ANON_KEY, LABS_URL } from "@/lib/supabase";

// Client helper for the labs edge function. The function verifies the
// caller's session and keys everything by the verified email, exactly
// like web-account. Returns the parsed JSON body; on a network or auth
// failure it returns { error } so callers can render an honest state.
export async function callLabs(action: string, payload: Record<string, unknown> = {}) {
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { error: "no_session" } as Record<string, unknown>;
  try {
    const res = await fetch(LABS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action, ...payload }),
    });
    return (await res.json().catch(() => ({ error: "bad_response" }))) as Record<string, unknown>;
  } catch {
    return { error: "network" } as Record<string, unknown>;
  }
}

export interface LabOrderRow {
  id: string;
  panel_id: string;
  panel_name: string;
  status: string;
  price_cents: number | null;
  payment_status: string;
  provider_order_id: string | null;
  created_at: string;
}
