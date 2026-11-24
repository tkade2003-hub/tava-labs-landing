
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

const GOAL_LABEL = { radiance: "mirdzums un starojums", fine_lines: "smalkās līnijas", hydration: "dziļa mitrināšana", even_tone: "vienmērīgs tonis" };
const SKIN_LABEL = { dry: "Sausa", oily: "Taukaina", combination: "Kombinēta", sensitive: "Jutīga", not_sure: "Vēl to noskaidroju" };
const CONCERN_LABEL = { dullness: "blāvums", fine_lines: "smalkās līnijas", uneven_tone: "nevienmērīgs tonis", texture: "raupja tekstūra", dryness: "sausums" };

const NOT_ALONE = {
  radiance: "Dibinātāji un satura veidotāji, kuri sevi prezentē katru dienu, savu rītu sāk vienādi. Blāva, nogurusi izskata āda ir viens no izplatītākajiem iemesliem, kāpēc cilvēki sāk seruma rutīnu. PDRN Brightening Serum ir veidots ap PDRN un peptīdiem vieglā formulā, kas radīta, lai uzlabotu gludas, mirdzošas ādas izskatu, liekot tai izskatīties kuplai, mīkstai un atsvaidzinātai no rīta un vakarā.",
  fine_lines: "Dibinātāji un satura veidotāji, kuri sevi prezentē katru dienu, savu rītu sāk vienādi. Smalkās līnijas parasti ir pirmā lieta, kuras dēļ cilvēki vēlas serumu. Šī formula apvieno Acetyl Hexapeptide-8 ar PDRN, sastāvdaļas, kas izvēlētas, lai atbalstītu ādu, kas izskatās gludāka un mirdzošāka, vienā solī divas reizes dienā. Nekāda desmit soļu rutīna nav vajadzīga.",
  hydration: "Dibinātāji un satura veidotāji, kuri sevi prezentē katru dienu, savu rītu sāk vienādi. Āda, kas līdz pusdienlaikam šķiet savilkta un izslāpusi, ir tieši tas, kam šis serums ir radīts. Glicerīna, Sodium PCA un Sodium Hyaluronate maisījums nodrošina dziļu mitrināšanu, bet Panthenol kopj, lai āda justos komfortabli un izskatītos kupla, nevis taukaina.",
  even_tone: "Dibinātāji un satura veidotāji, kuri sevi prezentē katru dienu, savu rītu sāk vienādi. Nevienmērīga izskata sejas krāsa ir izplatīta neapmierinātība. PDRN un peptīdi palīdz veicināt mirdzošāku, dzīvīgāka izskata sejas krāsu, un vieglā formula ātri un viegli iesūcas, vienkāršs solis divas reizes dienā ceļā uz vienmērīgāku izskatu."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Palīdz veicināt mirdzošāku, dzīvīgāka izskata sejas krāsu un uzlabo gludas, mirdzošas ādas izskatu.", match: ["radiance", "blāvums", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptīds, kas darbojas kopā ar PDRN, lai atbalstītu ādu, kas izskatās gludāka un vienmērīgāka.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hialuronskābe, glicerīns un Sodium PCA", text: "Mitrināšanas maisījums, kas piesaista mitrumu kuplai, komfortablai sajūtai un zīdaini gludai tekstūrai.", match: ["hydration", "sausums"] },
  { key: "panthenol", name: "Panthenol", text: "Kopj ādu, liekot tai justies mīkstai un komfortablai, saudzīga bāze ādai, kas viegli reaģē.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. nedēļa, tikai vakaros, katru otro vakaru", "2. nedēļa, katru vakaru", "3. līdz 4. nedēļa, no rīta un vakarā"] },
  sometimes:{ key: "standard", lines: ["1. līdz 3. diena, tikai vakaros", "No 4. dienas, no rīta un vakarā"] },
  never:    { key: "full",     lines: ["No 1. dienas, no rīta un vakarā, divas reizes dienā"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Iederas tieši pēc attīrīšanas, viens pievienots solis, apmēram minūte.",
  few_products: "Uzklājas pēc attīrīšanas, pirms jūsu mitrinātāja.",
  full_routine: "Kārtojas pēc attīrīšanas un pirms mitrinātāja un SPF, ne no kā nav jāatsakās."
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
  $("#naTitle").textContent = "Jūs neesat viens. " + GOAL_LABEL[g] + " ir tas, ar ko lielākā daļa cilvēku sāk.";
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
    `30 dienu plāns mērķim ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} āda, galvenās bažas ${CONCERN_LABEL[a.concern]}. ` +
    `Palielināšana: ${ramp.key} (${ramp.lines.join("; ")}). Uzklājiet plkst. ${fmtTime(a.amTime)} un ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} āda · uzsvars uz ${CONCERN_LABEL[a.concern]} · mērķis: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Palielināšana</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Jūsu laiki</span><span class="v">${fmtTime(a.amTime)} un ${fmtTime(a.pmTime)}, atgādinājumi tikai tad</span></div>
    <div class="planrow"><span class="k">Atbilstība rutīnai</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Pudele</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), izmērs lietošanai divas reizes dienā</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Sākt manu abonementu" : "Pirkt vienreiz") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Abonements atjaunojas ik pēc 30 dienām par $39. Jebkurā laikā apturiet vai atceliet."
    : "Vienreizējs pirkums par $49. Nekāda abonementa.";
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
  if (!s.firstName) missing.push("vārdu");
  if (!s.lastName) missing.push("uzvārdu");
  if (!s.address1) missing.push("ielas adresi");
  if (!s.city) missing.push("pilsētu");
  if (!s.stateCode) missing.push("štatu");
  if (!s.zip) missing.push("ZIP kodu");
  if (!p.email) missing.push("e pastu");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Gandrīz gatavs, pievienojiet savu " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Veic jūsu pasūtījumu…";

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
      btn.textContent = "Ved jūs uz drošu apmaksu…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Kaut kas nogāja greizi, veicot jūsu pasūtījumu, jūsu dati joprojām ir šeit, lūdzu, mēģiniet vēlreiz. Ja tas turpina neizdoties, rakstiet uz talia@tavalabs.app, un mēs to atrisināsim.";
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
    <h3>Pasūtījuma kopsavilkums</h3>
    <div class="planrow"><span class="k">Produkts</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Nosūta uz</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Jūsu plāns</span><span class="v">${plan.rampLines.join(" · ")}<br>Atgādinājumi plkst. ${fmtTime(p.answers.amTime)} un ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plāns nosūtīts uz</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Pierakstieties lietotnē ar ${p.email}, to pašu e pastu, kuru izmantojāt šeit, un jūsu atbildes, jūsu 30 dienu plāns un šis pasūtījums jau ir tur. Nekas nav jāievada no jauna.`;
}

syncBuyButton();
show(0, false);
