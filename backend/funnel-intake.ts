// Funnel intake for the Tava Labs quiz funnel (quiz.html in tava-labs-landing).
//
// DEPLOY: copy this file to the serum app's Supabase project as
//   supabase/functions/funnel-intake/index.ts
// in tkade2003-hub/tava-labs-serum. The ../_shared imports below resolve
// against that repo's existing shared modules. Run the migration in
// FUNNEL.md first (adds profiles.quiz_answers, profiles.plan and an
// email lookup index).
//
// What it does, in order:
//   1. Verifies the shared secret header (x-funnel-secret vs FUNNEL_INTAKE_SECRET).
//   2. Validates the funnel payload (shape mirrors quiz.html exactly).
//   3. Finds the customer by email — or creates a lead profile keyed by that
//      email (id "lead:<uuid>") so the data exists before the person ever
//      installs the app. When they later sign in to the app with the same
//      email, the app-side merge (see FUNNEL.md) re-keys everything to
//      their real profile id.
//   4. Upserts quiz answers + plan onto profiles, routine times onto the
//      existing morning_time / night_time columns, and the shipping
//      address onto customer_details.
//   5. Creates the orders row (status 0 = ordered, ship_to snapshot).
//   6. Hands off to Supliful placement — GATED on payment confirmation.
//      See the TODO in placeSuplifulOrder() before enabling it live.
import { createAdminClient } from "../_shared/auth.ts";
import { corsHeaders, json } from "../_shared/messaging.ts";

// ---------- Payload types (mirror quiz.html's payload contract) ----------

interface FunnelAnswers {
  goal: string;
  skinType: string;
  concern: string;
  sensitivity: string;
  routine: string;
  amTime: string; // "HH:MM" 24h
  pmTime: string; // "HH:MM" 24h
}

interface FunnelPayload {
  email: string;
  source: string;
  answers: FunnelAnswers;
  plan: { rampSchedule: string; summary: string };
  order: {
    productId: string;
    sku: string;
    quantity: number;
    purchaseType: "subscribe" | "one_time";
    price: number;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    stateCode: string;
    zip: string;
    countryCode: string;
    phone?: string;
  };
}

// Server-side source of truth. Never trust the prices/product the client sent.
const PRODUCT = {
  productId: "cbbc7de1-994e-45be-94d8-ac4be3b8cc18", // Supliful: Glow Brightening Serum
  sku: "VASHO-PBS-8FB6",
  itemName: "Glow Brightening Serum",
};
const PRICES: Record<FunnelPayload["order"]["purchaseType"], number> = {
  subscribe: 39,
  one_time: 49,
};

const GOALS = ["radiance", "fine_lines", "hydration", "even_tone"];
const SKIN_TYPES = ["dry", "oily", "combination", "sensitive", "not_sure"];
const CONCERNS = ["dullness", "fine_lines", "uneven_tone", "texture", "dryness"];
const SENSITIVITIES = ["often", "sometimes", "never"];
const ROUTINES = ["cleanser_only", "few_products", "full_routine"];
const RAMPS = ["gentle", "standard", "full"];

// ---------- Validation ----------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, max = 300): string | null {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null;
}

function validatePayload(raw: unknown): { ok: true; value: FunnelPayload } | { ok: false; error: string } {
  if (!isRecord(raw)) return { ok: false, error: "Body must be a JSON object" };

  const email = str(raw.email, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Valid email required" };
  if (raw.source !== "quiz-funnel") return { ok: false, error: "Unknown source" };

  if (!isRecord(raw.answers)) return { ok: false, error: "answers missing" };
  const a = raw.answers;
  const answers: FunnelAnswers = {
    goal: str(a.goal) ?? "",
    skinType: str(a.skinType) ?? "",
    concern: str(a.concern) ?? "",
    sensitivity: str(a.sensitivity) ?? "",
    routine: str(a.routine) ?? "",
    amTime: str(a.amTime, 5) ?? "",
    pmTime: str(a.pmTime, 5) ?? "",
  };
  if (!GOALS.includes(answers.goal)) return { ok: false, error: "Invalid answers.goal" };
  if (!SKIN_TYPES.includes(answers.skinType)) return { ok: false, error: "Invalid answers.skinType" };
  if (!CONCERNS.includes(answers.concern)) return { ok: false, error: "Invalid answers.concern" };
  if (!SENSITIVITIES.includes(answers.sensitivity)) return { ok: false, error: "Invalid answers.sensitivity" };
  if (!ROUTINES.includes(answers.routine)) return { ok: false, error: "Invalid answers.routine" };
  const timeOk = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  if (!timeOk(answers.amTime) || !timeOk(answers.pmTime)) return { ok: false, error: "Invalid routine times" };

  if (!isRecord(raw.plan)) return { ok: false, error: "plan missing" };
  const rampSchedule = str(raw.plan.rampSchedule, 40) ?? "";
  const summary = str(raw.plan.summary, 2000);
  if (!RAMPS.includes(rampSchedule) || !summary) return { ok: false, error: "Invalid plan" };

  if (!isRecord(raw.order)) return { ok: false, error: "order missing" };
  const purchaseType = raw.order.purchaseType;
  if (purchaseType !== "subscribe" && purchaseType !== "one_time") {
    return { ok: false, error: "Invalid order.purchaseType" };
  }
  if (raw.order.productId !== PRODUCT.productId || raw.order.sku !== PRODUCT.sku) {
    return { ok: false, error: "Unknown product" };
  }
  if (raw.order.quantity !== 1) return { ok: false, error: "Quantity must be 1" };
  if (raw.order.price !== PRICES[purchaseType]) return { ok: false, error: "Price mismatch" };

  if (!isRecord(raw.shippingAddress)) return { ok: false, error: "shippingAddress missing" };
  const s = raw.shippingAddress;
  const shippingAddress: FunnelPayload["shippingAddress"] = {
    firstName: str(s.firstName, 100) ?? "",
    lastName: str(s.lastName, 100) ?? "",
    address1: str(s.address1, 200) ?? "",
    address2: str(s.address2, 200) ?? undefined,
    city: str(s.city, 100) ?? "",
    stateCode: (str(s.stateCode, 2) ?? "").toUpperCase(),
    zip: str(s.zip, 20) ?? "",
    countryCode: (str(s.countryCode, 2) ?? "").toUpperCase(),
    phone: str(s.phone, 40) ?? undefined,
  };
  if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address1 ||
      !shippingAddress.city || !shippingAddress.stateCode || !shippingAddress.zip ||
      !shippingAddress.countryCode) {
    return { ok: false, error: "shippingAddress is missing required fields" };
  }

  return {
    ok: true,
    value: {
      email,
      source: "quiz-funnel",
      answers,
      plan: { rampSchedule, summary },
      order: { productId: PRODUCT.productId, sku: PRODUCT.sku, quantity: 1, purchaseType, price: PRICES[purchaseType] },
      shippingAddress,
    },
  };
}

// ---------- Supliful placement (payment-gated) ----------

// Places the fulfillment order with Supliful. This is the single server-side
// point that turns a funnel order row into a real Supliful order.
async function placeSuplifulOrder(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  payload: FunnelPayload,
): Promise<{ placed: boolean; reason?: string }> {
  // TODO(payment): Do NOT place live Supliful orders until payment is
  // confirmed for this order. Payment architecture (decided 2026-11-16):
  // Stripe checkout on the funnel/landing page, Apple Pay in the app with
  // Stripe behind it. The gate goes here: verify the Stripe payment for
  // this order (e.g. a paid payment_intent recorded on the orders row by
  // the Stripe webhook) and return early unless it is confirmed paid.
  // Until that exists, placement stays off — an unpaid funnel submission
  // must never become a real shipment. Nothing here fakes a charge.
  const paymentConfirmed = false;
  if (!paymentConfirmed) {
    return { placed: false, reason: "awaiting_payment_integration" };
  }

  const apiKey = Deno.env.get("SUPLIFUL_API_KEY");
  if (!apiKey) return { placed: false, reason: "supliful_not_configured" };

  const s = payload.shippingAddress;
  const res = await fetch("https://public-api.supliful.com/v1/orders", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Cloudflare in front of the API bans the default client signature.
      "User-Agent": "TavaLabs-FunnelIntake/1.0 (+https://tavalabs.app)",
    },
    body: JSON.stringify({
      // Idempotency: our orders.id is the externalOrderId, so a retry
      // returns the existing Supliful order instead of double-shipping.
      externalOrderId: orderId,
      testMode: Deno.env.get("SUPLIFUL_TEST_MODE") === "true",
      shippingAddress: {
        firstName: s.firstName,
        lastName: s.lastName,
        address1: s.address1,
        ...(s.address2 ? { address2: s.address2 } : {}),
        city: s.city,
        stateCode: s.stateCode,
        zip: s.zip,
        countryCode: s.countryCode,
        ...(s.phone ? { phone: s.phone } : {}),
      },
      lines: [{ productId: PRODUCT.productId, quantity: 1 }],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("funnel-intake: Supliful order failed", res.status, detail.slice(0, 500));
    return { placed: false, reason: `supliful_${res.status}` };
  }
  const created = await res.json().catch(() => null) as { id?: string } | null;
  if (created?.id) {
    // The Supliful order id is recoverable at any time via
    // GET /v1/orders/<our orders.id> thanks to the externalOrderId above.
    // Persist it on the order row once the fulfillment-columns migration
    // (supliful_order_id etc., from the serum integration branch) lands.
    console.log("funnel-intake: Supliful order placed", created.id, "for order", orderId);
  }
  return { placed: true };
}

// ---------- Handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // The funnel page is public and anonymous, so the endpoint is protected
    // by a shared secret instead of a user JWT (same pattern family as the
    // messaging-cron x-cron-key). quiz.html must send this header once live:
    // add "x-funnel-secret" to its fetch headers alongside FUNNEL_INTAKE_URL.
    const secret = Deno.env.get("FUNNEL_INTAKE_SECRET");
    if (!secret || req.headers.get("x-funnel-secret") !== secret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const raw = await req.json().catch(() => null);
    const validated = validatePayload(raw);
    if (!validated.ok) return json({ error: validated.error }, 400);
    const payload = validated.value;

    const admin = createAdminClient();
    const s = payload.shippingAddress;
    const fullName = `${s.firstName} ${s.lastName}`;

    // 1) Find the customer by email, or create a lead profile keyed by it.
    const { data: existing, error: findError } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", payload.email)
      .maybeSingle();
    if (findError) throw findError;

    let userId: string;
    let isNewLead = false;
    if (existing?.id) {
      userId = existing.id as string;
    } else {
      userId = `lead:${crypto.randomUUID()}`;
      isNewLead = true;
      const { error: insertError } = await admin.from("profiles").insert({
        id: userId,
        name: fullName,
        email: payload.email,
      });
      if (insertError) throw insertError;
    }

    // 2) Upsert the quiz answers, plan, and routine times onto the profile.
    const { error: profileError } = await admin.from("profiles").update({
      name: fullName,
      quiz_answers: { ...payload.answers, source: payload.source },
      plan: { rampSchedule: payload.plan.rampSchedule, summary: payload.plan.summary },
      morning_time: payload.answers.amTime,
      night_time: payload.answers.pmTime,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    if (profileError) throw profileError;

    // 3) Upsert the shipping address onto customer_details.
    const { error: detailsError } = await admin.from("customer_details").upsert({
      user_id: userId,
      full_name: fullName,
      address_line1: s.address1,
      address_line2: s.address2 ?? null,
      city: s.city,
      state: s.stateCode,
      postal_code: s.zip,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (detailsError) throw detailsError;

    // 4) Create the order row. total is recomputed server-side from PRICES.
    const shipTo = [fullName, s.address1, s.address2, `${s.city}, ${s.stateCode} ${s.zip}`, s.countryCode]
      .filter(Boolean)
      .join(", ");
    const orderNumber = `TV-${Date.now().toString(36).toUpperCase()}`;
    const { data: order, error: orderError } = await admin.from("orders").insert({
      user_id: userId,
      order_number: orderNumber,
      item: PRODUCT.itemName,
      quantity: 1,
      total: payload.order.price,
      is_subscription: payload.order.purchaseType === "subscribe",
      status: 0,
      ship_to: shipTo,
    }).select("id,order_number").single();
    if (orderError) throw orderError;

    // 5) Supliful placement — currently gated off until payment exists.
    const placement = await placeSuplifulOrder(admin, order.id as string, payload);
    if (!placement.placed && placement.reason !== "awaiting_payment_integration") {
      console.error("funnel-intake: placement issue", placement.reason, "order", order.id);
    }

    return json({
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      leadCreated: isNewLead,
      fulfillment: placement.placed ? "placed" : "pending_payment",
    });
  } catch (err) {
    console.error("funnel-intake", err);
    return json({ error: "Internal error" }, 500);
  }
});
