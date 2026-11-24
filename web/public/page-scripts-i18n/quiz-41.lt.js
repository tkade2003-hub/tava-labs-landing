
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

const GOAL_LABEL = { radiance: "skaistesnė atrodanti oda", fine_lines: "smulkios raukšlės", hydration: "gilus drėkinimas", even_tone: "tolygus tonas" };
const SKIN_LABEL = { dry: "Sausa", oily: "Riebi", combination: "Mišri", sensitive: "Jautri", not_sure: "Dar aiškinuosi" };
const CONCERN_LABEL = { dullness: "blankumas", fine_lines: "smulkios raukšlės", uneven_tone: "netolygus tonas", texture: "šiurkšti tekstūra", dryness: "sausumas" };

const NOT_ALONE = {
  radiance: "Įkūrėjai ir kūrėjai, kurie save pristato kiekvieną dieną, rytą pradeda taip pat. Blanki, pavargusi atrodanti oda yra viena dažniausių priežasčių, dėl kurių žmonės pradeda serumo rutiną. PDRN Brightening Serum yra sukurtas aplink PDRN ir peptidus, lengvoje formulėje, kuri padeda odai atrodyti lygiai ir skaistčiai, ryte ir vakare.",
  fine_lines: "Įkūrėjai ir kūrėjai, kurie save pristato kiekvieną dieną, rytą pradeda taip pat. Smulkios linijos paprastai yra pirmas dalykas, dėl kurio žmonės nori serumo. Ši formulė derina acetilheksapeptidą-8 su PDRN, dvi sudedamosias dalis, pasirinktas odai, kuri atrodo lygesnė ir skaistesnė, palaikyti, vienu žingsniu, du kartus per dieną. Dešimties žingsnių rutinos nereikia.",
  hydration: "Įkūrėjai ir kūrėjai, kurie save pristato kiekvieną dieną, rytą pradeda taip pat. Oda, kuri iki vidurdienio jaučiasi įtempta ir sausa, yra būtent tai, kam šis serumas sukurtas. Glicerino, natrio PCA ir natrio hialuronato mišinys suteikia gilų drėkinimą, o pantenolis kondicionuoja odą, kad ji jaustųsi patogiai ir sudrėkinta, o ne riebi.",
  even_tone: "Įkūrėjai ir kūrėjai, kurie save pristato kiekvieną dieną, rytą pradeda taip pat. Netolygi veido oda yra dažnas nusivylimas. PDRN ir peptidai padeda odai atrodyti skaistesnei ir lygesnei, o lengva formulė greitai įsigeria, paprastu žingsniu, naudojamu du kartus per dieną."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Padeda odai atrodyti skaistesnei, lygesnei ir lygiai.", match: ["radiance", "blankumas", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl Hexapeptide-8", text: "Peptidas, veikiantis kartu su PDRN, kad palaikytų odą, kuri atrodo lygesnė ir tolygesnė.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hialurono rūgštis, glicerinas ir Sodium PCA", text: "Drėkinimo mišinys, kuris traukia drėgmę, odai, kuri jaučiasi patogiai ir lygiai.", match: ["hydration", "sausumas"] },
  { key: "panthenol", name: "Panthenol", text: "Kondicionuoja odą, palikdamas ją minkštą ir patogią, švelnus pagrindas odai, kuri lengvai reaguoja.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1 savaitė, tik vakarais, kas antrą vakarą", "2 savaitė, kiekvieną vakarą", "3 iki 4 savaitės, ryte ir vakare"] },
  sometimes:{ key: "standard", lines: ["1 iki 3 dienos, tik vakarais", "Nuo 4 dienos, ryte ir vakare"] },
  never:    { key: "full",     lines: ["Nuo 1 dienos, ryte ir vakare, du kartus per dieną"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Įsiterpia iškart po valymo, vienas pridėtas žingsnis, apie minutę.",
  few_products: "Tepamas po valymo, prieš jūsų drėkiklį.",
  full_routine: "Dedamas po valymo ir prieš drėkiklį bei SPF, nieko nereikia atsisakyti."
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
  $("#naTitle").textContent = "Jūs nesate vieni. " + GOAL_LABEL[g] + " yra tai, nuo ko pradeda dauguma žmonių.";
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
    `30 dienų planas tikslui ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} oda, pagrindinis rūpestis ${CONCERN_LABEL[a.concern]}. ` +
    `Įsibėgėjimas: ${ramp.key} (${ramp.lines.join("; ")}). Tepkite ${fmtTime(a.amTime)} ir ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} oda · dėmesys skiriamas ${CONCERN_LABEL[a.concern]} · tikslas: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Įsibėgėjimas</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Jūsų laikai</span><span class="v">${fmtTime(a.amTime)} ir ${fmtTime(a.pmTime)}, priminimai tik tada</span></div>
    <div class="planrow"><span class="k">Rutinos atitikimas</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Buteliukas</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dydis naudojimui du kartus per dieną</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Pradėti mano prenumeratą" : "Pirkti vieną kartą") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Prenumerata atsinaujina kas 30 dienų už $39. Pristabdykite arba atšaukite bet kada."
    : "Vienkartinis pirkimas už $49. Jokios prenumeratos.";
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
  if (!s.firstName) missing.push("vardą");
  if (!s.lastName) missing.push("pavardę");
  if (!s.address1) missing.push("gatvės adresą");
  if (!s.city) missing.push("miestą");
  if (!s.stateCode) missing.push("valstiją");
  if (!s.zip) missing.push("ZIP kodą");
  if (!p.email) missing.push("el. paštą");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Jau beveik, pridėkite savo " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Pateikiamas jūsų užsakymas…";

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
      btn.textContent = "Nukreipiama į saugų atsiskaitymą…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Kažkas nepavyko pateikiant jūsų užsakymą, jūsų duomenys vis dar čia, bandykite dar kartą. Jei tai kartojasi, rašykite support@tavalabs.app ir mes viską sutvarkysime.";
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
    <h3>Užsakymo suvestinė</h3>
    <div class="planrow"><span class="k">Produktas</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Siunčiama į</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Jūsų planas</span><span class="v">${plan.rampLines.join(" · ")}<br>Priminimai ${fmtTime(p.answers.amTime)} ir ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Planas išsiųstas į</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Prisijunkite prie programėlės su ${p.email}, tuo pačiu el. paštu, kurį naudojote čia, ir jūsų atsakymai, jūsų 30 dienų planas bei šis užsakymas jau yra ten. Nieko nereikia įvesti iš naujo.`;
}

syncBuyButton();
show(0, false);
