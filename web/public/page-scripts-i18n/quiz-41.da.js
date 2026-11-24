
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

const GOAL_LABEL = { radiance: "glød og stråling", fine_lines: "fine linjer", hydration: "dyb fugt", even_tone: "en ensartet tone" };
const SKIN_LABEL = { dry: "Tør", oily: "Fedtet", combination: "Kombineret", sensitive: "Sensitiv", not_sure: "Jeg er stadig ved at finde ud af det" };
const CONCERN_LABEL = { dullness: "mathed", fine_lines: "fine linjer", uneven_tone: "uensartet tone", texture: "ru tekstur", dryness: "tørhed" };

const NOT_ALONE = {
  radiance: "Stiftere og skabere, der præsenterer sig selv hver dag, starter deres morgen på samme måde. Mat, træt udseende hud er en af de mest almindelige grunde til, at folk starter en serumrutine. PDRN Brightening Serum er bygget omkring PDRN og peptider, i en let formel designet til at forbedre udseendet af glat, strålende hud og efterlade den fyldig, blød og frisk, morgen og aften.",
  fine_lines: "Stiftere og skabere, der præsenterer sig selv hver dag, starter deres morgen på samme måde. Fine linjer er som regel det første, folk ønsker et serum til. Denne formel kombinerer Acetyl Hexapeptide-8 med PDRN, ingredienser valgt til at støtte hud, der ser glattere og mere lysende ud, i ét enkelt trin, to gange om dagen. Ingen rutine i ti trin nødvendig.",
  hydration: "Stiftere og skabere, der præsenterer sig selv hver dag, starter deres morgen på samme måde. Hud, der føles stram og tørstig midt på dagen, er præcis det, dette serum er lavet til. En blanding af glycerin, Sodium PCA og Sodium Hyaluronate giver dyb fugt, mens Panthenol plejer, så huden føles behagelig og ser fyldig ud, ikke fedtet.",
  even_tone: "Stiftere og skabere, der præsenterer sig selv hver dag, starter deres morgen på samme måde. En uensartet udseende teint er en almindelig frustration. PDRN og peptider hjælper med at fremme en mere lysende, levende udseende teint, og den lette formel absorberes hurtigt og nemt, et enkelt trin to gange dagligt mod et mere ensartet udseende."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Hjælper med at fremme en mere lysende, levende udseende teint og forbedrer udseendet af glat, strålende hud.", match: ["radiance", "mathed", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Et peptid, der arbejder sammen med PDRN om at støtte hud, der ser glattere og mere ensartet ud.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronsyre, glycerin og Sodium PCA", text: "En fugtblanding, der trækker fugt ind for en fyldig, behagelig følelse og en silkeblød tekstur.", match: ["hydration", "tørhed"] },
  { key: "panthenol", name: "Panthenol", text: "Plejer huden og efterlader den blød og behagelig, en mild base til hud, der reagerer let.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Uge 1, kun om aftenen, hver anden aften", "Uge 2, hver aften", "Uge 3 til 4, morgen og aften"] },
  sometimes:{ key: "standard", lines: ["Dag 1 til 3, kun om aftenen", "Fra dag 4 og frem, morgen og aften"] },
  never:    { key: "full",     lines: ["Fra dag 1, morgen og aften, to gange dagligt"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Passer ind lige efter rens, ét ekstra trin, cirka et minut.",
  few_products: "Påføres efter rens, før din fugtighedscreme.",
  full_routine: "Lægges i lag efter rens og før fugtighedscreme og SPF, uden at give afkald på noget."
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
  $("#naTitle").textContent = "Du er ikke alene. " + GOAL_LABEL[g] + " er der, hvor de fleste starter.";
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
    `30 dages plan for ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} hud, primær bekymring ${CONCERN_LABEL[a.concern]}. ` +
    `Optrapning: ${ramp.key} (${ramp.lines.join("; ")}). Påfør kl. ${fmtTime(a.amTime)} og ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} hud · fokus på ${CONCERN_LABEL[a.concern]} · mål: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Optrapning</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Dine tider</span><span class="v">${fmtTime(a.amTime)} og ${fmtTime(a.pmTime)}, kun påmindelser der</span></div>
    <div class="planrow"><span class="k">Pasform til rutinen</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Flasken</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimensioneret til brug to gange dagligt</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Start mit abonnement" : "Køb én gang") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Abonnementet fornyes hver 30. dag til $39. Sæt på pause eller annuller når som helst."
    : "Engangskøb på $49. Intet abonnement.";
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
  if (!s.firstName) missing.push("fornavn");
  if (!s.lastName) missing.push("efternavn");
  if (!s.address1) missing.push("gadeadresse");
  if (!s.city) missing.push("by");
  if (!s.stateCode) missing.push("stat");
  if (!s.zip) missing.push("postnummer");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Næsten færdig, tilføj dine " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Afgiver din ordre…";

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
      btn.textContent = "Sender dig til sikker betaling…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Noget gik galt under afgivelsen af din ordre, dine oplysninger er stadig her, prøv venligst igen. Hvis det bliver ved med at fejle, så skriv til talia@tavalabs.app, så ordner vi det.";
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
    <h3>Ordreoversigt</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Sendes til</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Din plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Påmindelser kl. ${fmtTime(p.answers.amTime)} og ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan sendt til</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Log ind i appen med ${p.email}, den samme email som du brugte her, så er dine svar, din 30 dages plan og denne ordre allerede der. Intet at indtaste igen.`;
}

syncBuyButton();
show(0, false);
