
"use strict";
/* ============================================================
   CONFIG — set FUNNEL_INTAKE_URL to the deployed funnel-intake
   edge function URL to go live, e.g.
   "https://<project>.supabase.co/functions/v1/funnel-intake".
   While it is empty the page runs in DEMO mode: no charge, no
   network call — the payload is logged + saved to localStorage.
   ============================================================ */
const FUNNEL_INTAKE_URL = "https://vuzrpgkqytzvbbxwsvqr.supabase.co/functions/v1/funnel-intake";

const PRODUCT = { productId: "cbbc7de1-994e-45be-94d8-ac4be3b8cc18", sku: "VASHO-PBS-8FB6" };
const PRICES = { subscribe: 39, one_time: 49 };

const GOAL_LABEL = { radiance: "brighter looking skin", fine_lines: "fine lines", hydration: "deep hydration", even_tone: "an even tone" };
const SKIN_LABEL = { dry: "Dry", oily: "Oily", combination: "Combination", sensitive: "Sensitive", not_sure: "Still figuring it out" };
const CONCERN_LABEL = { dullness: "dullness", fine_lines: "fine lines", uneven_tone: "uneven tone", texture: "rough texture", dryness: "dryness" };

const NOT_ALONE = {
  radiance: "Founders and creators who present themselves every day start their morning the same way. Dull, tired looking skin is one of the most common reasons people start a serum routine. The PDRN Brightening Serum is built around PDRN and peptides, in a lightweight formula that helps skin look smooth and bright, morning and night.",
  fine_lines: "Founders and creators who present themselves every day start their morning the same way. Fine lines are usually the first thing people want a serum for. This formula pairs acetyl hexapeptide-8 with PDRN, two ingredients chosen to support skin that looks smoother and brighter, in a single step, twice a day. No ten step routine required.",
  hydration: "Founders and creators who present themselves every day start their morning the same way. Skin that feels tight and dry by midday is exactly what this serum is made for. A blend of glycerin, sodium PCA, and sodium hyaluronate provides deep hydration, while panthenol conditions the skin, so it feels comfortable and hydrated, not greasy.",
  even_tone: "Founders and creators who present themselves every day start their morning the same way. An uneven looking complexion is a common frustration. PDRN and peptides help skin look brighter and more even, and the lightweight formula absorbs quickly, in a simple step used twice a day."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Helps skin look brighter, more even, and smooth.", match: ["radiance", "dullness", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "A peptide that works alongside PDRN to support skin that looks smoother and more even.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "A hydration blend that draws in moisture, for skin that feels comfortable and smooth.", match: ["hydration", "dryness"] },
  { key: "panthenol", name: "Panthenol", text: "Conditions the skin, leaving it feeling soft and comfortable, a kind base for skin that reacts easily.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Week 1 — evenings only, every other night", "Week 2 — every evening", "Weeks 3–4 — morning and evening"] },
  sometimes:{ key: "standard", lines: ["Days 1–3 — evenings only", "Day 4 onward — morning and evening"] },
  never:    { key: "full",     lines: ["From day 1 — morning and evening, twice daily"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Slots in right after cleansing — one added step, about a minute.",
  few_products: "Goes on after cleansing, before your moisturizer.",
  full_routine: "Layers after cleansing and before moisturizer and SPF — nothing to give up."
};

const state = {
  answers: { goal: null, skinType: null, concern: null, sensitivity: null, routine: null, amTime: "07:30", pmTime: "22:00" },
  email: "",
  purchaseType: "subscribe"
};

const FLOW = ["hook", "goal", "notalone", "skinType", "concern", "match", "sensitivity", "routine", "times", "email", "plan", "checkout", "thanks"];
let current = 0;
const historyStack = [];

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + String(m).padStart(2, "0") + " " + suffix;
}

function show(index, push = true) {
  if (push && FLOW[index] !== FLOW[current]) historyStack.push(current);
  current = index;
  const name = FLOW[index];
  $$(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  const screen = $(`.screen[data-screen="${name}"]`);
  const zone = $("#progressZone");
  const hasBar = screen.dataset.progress !== undefined;
  zone.hidden = !hasBar;
  if (hasBar) {
    $("#barFill").style.width = screen.dataset.progress + "%";
    $("#stepLabel").textContent = screen.dataset.stepLabel || "";
  }
  $("#backBtn").classList.toggle("show", historyStack.length > 0 && name !== "thanks");
  document.body.classList.toggle("planstep", name === "plan");
  if (name === "notalone") renderNotAlone();
  if (name === "match") renderMatch();
  if (name === "plan") renderPlan();
  if (name === "plan" && window.posthog && !window.__tavaQuizCompleted) { window.__tavaQuizCompleted = true; posthog.capture("quiz_completed"); }
  window.scrollTo({ top: 0, behavior: "instant" });
}

function next() { if (current < FLOW.length - 1) show(current + 1); }

$("#backBtn").addEventListener("click", () => {
  if (!historyStack.length) return;
  const prev = historyStack.pop();
  show(prev, false);
});

$$("[data-next]").forEach(btn => btn.addEventListener("click", next));

/* Single-choice groups: select, then auto-advance (unless checkout purchase type). */
$$("[data-choice-group]").forEach(group => {
  const key = group.dataset.choiceGroup;
  group.addEventListener("click", e => {
    const btn = e.target.closest(".choice");
    if (!btn) return;
    $$(".choice", group).forEach(c => c.classList.toggle("selected", c === btn));
    if (key === "purchaseType") {
      state.purchaseType = btn.dataset.value;
      syncBuyButton();
      return;
    }
    state.answers[key] = btn.dataset.value;
    setTimeout(next, 260);
  });
});

/* Time chips + custom inputs */
$$("[data-time-chips]").forEach(group => {
  const key = group.dataset.timeChips;
  const custom = key === "amTime" ? $("#amCustom") : $("#pmCustom");
  const sync = () => {
    $$(".chip", group).forEach(c => c.classList.toggle("selected", c.dataset.value === state.answers[key]));
    custom.value = $$(".chip", group).some(c => c.dataset.value === state.answers[key]) ? "" : state.answers[key];
  };
  group.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.answers[key] = chip.dataset.value;
    sync();
  });
  custom.addEventListener("change", () => { if (custom.value) { state.answers[key] = custom.value; sync(); } });
  sync();
});

/* Email step */
$("#emailNext").addEventListener("click", () => {
  const v = $("#emailInput").value.trim();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  $("#emailErr").style.display = ok ? "none" : "block";
  if (!ok) return;
  state.email = v;
  next();
});

function renderNotAlone() {
  const g = state.answers.goal || "radiance";
  $("#naTitle").textContent = "You are not alone. " + GOAL_LABEL[g] + " is where most people start.";
  $("#naBody").textContent = NOT_ALONE[g];
}

function renderMatch() {
  const wanted = [state.answers.goal, state.answers.concern, state.answers.skinType];
  const scored = INGREDIENTS.map((ing, i) => ({
    ing, i,
    score: ing.match.some(m => wanted.includes(m)) ? 1 : 0
  })).sort((a, b) => b.score - a.score || a.i - b.i);
  const top = scored[0].ing.key;
  $("#matchBox").innerHTML = scored.map(({ ing }) =>
    `<div class="ing"><span class="name">${ing.name}</span>${ing.key === top ? '<span class="tag">Your top match</span>' : ""}<p>${ing.text}</p></div>`
  ).join("");
}

function buildPlan() {
  const a = state.answers;
  const ramp = RAMPS[a.sensitivity || "sometimes"];
  const summary =
    `30-day plan for ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} skin, main concern ${CONCERN_LABEL[a.concern]}. ` +
    `Ramp: ${ramp.key} (${ramp.lines.join("; ")}). Apply at ${fmtTime(a.amTime)} and ${fmtTime(a.pmTime)}. ` +
    ROUTINE_FIT[a.routine];
  return { rampSchedule: ramp.key, rampLines: ramp.lines, summary };
}

function renderPlan() {
  const a = state.answers;
  const plan = buildPlan();
  $("#planTitle").textContent = "PDRN Brightening Serum";
  $("#goalChips").innerHTML = [GOAL_LABEL[a.goal], CONCERN_LABEL[a.concern], SKIN_LABEL[a.skinType]]
    .map(s => `<span class="gchip">${s}</span>`).join("");
  $("#planBox").innerHTML = `
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} skin · focus on ${CONCERN_LABEL[a.concern]} · goal: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Ramp</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Your times</span><span class="v">${fmtTime(a.amTime)} and ${fmtTime(a.pmTime)} — reminders only then</span></div>
    <div class="planrow"><span class="k">Routine fit</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">The bottle</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml) — sized for twice-daily use</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Start my subscription" : "Buy once") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Subscription renews every 30 days at $39. Pause or cancel anytime."
    : "One-time purchase of $49. No subscription.";
}

function field(id) { return $("#" + id).value.trim(); }

function buildPayload() {
  const a = state.answers;
  const plan = buildPlan();
  return {
    email: state.email,
    source: "quiz-funnel",
    answers: {
      goal: a.goal, skinType: a.skinType, concern: a.concern,
      sensitivity: a.sensitivity, routine: a.routine,
      amTime: a.amTime, pmTime: a.pmTime
    },
    plan: { rampSchedule: plan.rampSchedule, summary: plan.summary },
    order: {
      productId: PRODUCT.productId, sku: PRODUCT.sku, quantity: 1,
      purchaseType: state.purchaseType, price: PRICES[state.purchaseType]
    },
    shippingAddress: {
      firstName: field("firstName"), lastName: field("lastName"),
      address1: field("address1"), address2: field("address2"),
      city: field("city"), stateCode: field("stateCode").toUpperCase(),
      zip: field("zip"), countryCode: field("countryCode"), phone: field("phone")
    }
  };
}

function validateShipping(p) {
  const s = p.shippingAddress;
  const missing = [];
  if (!s.firstName) missing.push("first name");
  if (!s.lastName) missing.push("last name");
  if (!s.address1) missing.push("street address");
  if (!s.city) missing.push("city");
  if (!s.stateCode) missing.push("state");
  if (!s.zip) missing.push("ZIP code");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Almost there — add your " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Placing your order…";

  if (DEMO) {
    console.log("[Tava funnel · DEMO] payload:", JSON.stringify(payload, null, 2));
    try { localStorage.setItem("tava_funnel_payload", JSON.stringify(payload)); } catch (_) {}
    renderThanks(payload, true);
    btn.disabled = false;
    syncBuyButton();
    next();
    return;
  }

  try {
    const res = await fetch(FUNNEL_INTAKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Intake returned " + res.status);
    const data = await res.json().catch(() => null);
    if (data && data.checkoutUrl) {
      // Stripe-hosted checkout: hand the buyer off. After payment, Stripe
      // returns them to APP_PUBLIC_URL/checkout/success; if they back out,
      // to /checkout/cancel. The thank-you screen below is only a fallback
      // for an intake response without a checkout URL.
      btn.textContent = "Taking you to secure checkout…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Something went wrong placing your order — your details are still here, please try again. If it keeps failing, email support@tavalabs.app and we'll sort it out.";
    errBox.style.display = "block";
  } finally {
    btn.disabled = false;
    syncBuyButton();
  }
});

function renderThanks(p, demo) {
  $("#thanksDemo").hidden = !demo;
  const s = p.shippingAddress;
  const plan = buildPlan();
  $("#thanksBox").innerHTML = `
    <h3>Order summary</h3>
    <div class="planrow"><span class="k">Product</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Ships to</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Your plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Reminders at ${fmtTime(p.answers.amTime)} and ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan sent to</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Sign in to the app with ${p.email} — the same email you used here — and your answers, your 30-day plan, and this order are already there. Nothing to re-type.`;
}

syncBuyButton();
show(0, false);
