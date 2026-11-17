// Funnel intake for the Tava Labs quiz funnel (quiz.html in tava-labs-landing).
//
// This is the funnel's public, anonymous endpoint (verify_jwt off, by
// design): the quiz page has no user account and no credentials to present.
// What protects it is strict payload validation plus server-owned pricing —
// it can only ever create an UNPAID order and a Stripe Checkout Session for
// the one serum product at the prices in _shared/pricing.ts. Nothing ships
// from here: fulfillment happens only after the Stripe webhook confirms
// payment (stripe-webhook -> markOrderPaid -> handoffToSupliful, in-process).
//
// What it does, in order:
//   1. Validates the funnel payload (shape mirrors quiz.html exactly).
//      Amount-shaped fields (order.price) are ignored, never trusted.
//   2. Finds the customer by email — or creates a lead profile keyed by that
//      email (id "lead:<uuid>") so the data exists before the person ever
//      installs the app. When they later sign in to the app with the same
//      email, the app-side merge (see FUNNEL.md) re-keys everything to
//      their real profile id.
//   3. Upserts quiz answers + plan onto profiles, routine times onto the
//      existing morning_time / night_time columns, and the shipping
//      address onto customer_details.
//   4. Creates the order + Stripe Checkout Session IN-PROCESS via
//      _shared/checkout.ts (the same code create-checkout runs).
//      Function-to-function HTTP invokes are broken in this project, so
//      there is deliberately no HTTP hop to create-checkout here.
//   5. Returns { checkoutUrl, orderId, ... } — quiz.html redirects the
//      buyer to checkoutUrl (Stripe-hosted checkout).
import { createAdminClient } from "../_shared/auth.ts";
import { corsHeaders, json } from "../_shared/messaging.ts";
import { PricingError } from "../_shared/pricing.ts";
import { createCheckoutSession } from "../_shared/checkout.ts";
import type { ShippingAddress } from "../_shared/orders.ts";

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

// Server-side source of truth for which product the funnel sells. The
// client-sent productId/sku are checked against these, never trusted.
const PRODUCT = {
  productId: "cbbc7de1-994e-45be-94d8-ac4be3b8cc18", // Supliful: Glow Brightening Serum
  sku: "VASHO-PBS-8FB6",
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
  // raw.order.price is deliberately NOT read: pricing is server-owned
  // (_shared/pricing.ts) and any amount the client sends is ignored.

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
      order: { productId: PRODUCT.productId, sku: PRODUCT.sku, quantity: 1, purchaseType },
      shippingAddress,
    },
  };
}

// ---------- Handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
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

    // 4) Create the order + Stripe Checkout Session in-process. The order
    //    row, its server-computed total, and the session all come from the
    //    same shared code create-checkout runs.
    const shippingAddress: ShippingAddress = {
      name: fullName,
      line1: s.address1,
      line2: s.address2,
      city: s.city,
      state: s.stateCode,
      postalCode: s.zip,
      country: s.countryCode,
    };
    const result = await createCheckoutSession(admin, {
      userId,
      purchaseType: payload.order.purchaseType,
      quantity: 1,
      shippingAddress,
    });

    return json({
      ok: true,
      checkoutUrl: result.checkoutUrl,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      leadCreated: isNewLead,
    });
  } catch (err) {
    if (err instanceof PricingError) return json({ error: err.message }, 400);
    console.error("funnel-intake", err);
    return json({ error: "Internal error" }, 500);
  }
});
