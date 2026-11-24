
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

const GOAL_LABEL = { radiance: "sijaj in svetlost", fine_lines: "drobne gubice", hydration: "globoko vlaženje", even_tone: "enakomeren ton" };
const SKIN_LABEL = { dry: "Suha", oily: "Mastna", combination: "Mešana", sensitive: "Občutljiva", not_sure: "Še ugotavljam" };
const CONCERN_LABEL = { dullness: "pustost", fine_lines: "drobne gubice", uneven_tone: "neenakomeren ton", texture: "groba tekstura", dryness: "suhost" };

const NOT_ALONE = {
  radiance: "Ustanovitelji in ustvarjalci, ki se vsak dan predstavljajo, začnejo svoje jutro na enak način. Pusta in utrujena koža je eden najpogostejših razlogov, da ljudje začnejo rutino s serumom. PDRN Brightening Serum je zgrajen okoli PDRN in peptidov, v lahki formuli, zasnovani za izboljšanje videza gladke in sijoče kože, da je videti napeta, mehka in osvežena, zjutraj in zvečer.",
  fine_lines: "Ustanovitelji in ustvarjalci, ki se vsak dan predstavljajo, začnejo svoje jutro na enak način. Drobne gubice so običajno prva stvar, zaradi katere ljudje želijo serum. Ta formula združuje Acetyl Hexapeptide-8 s PDRN, sestavini, izbrani za podporo koži, ki je videti gladkejša in svetlejša, v enem samem koraku, dvakrat na dan. Rutina v desetih korakih ni potrebna.",
  hydration: "Ustanovitelji in ustvarjalci, ki se vsak dan predstavljajo, začnejo svoje jutro na enak način. Koža, ki je do poldneva napeta in žejna, je točno tisto, za kar je ta serum narejen. Mešanica glicerina, natrijevega PCA in natrijevega hialuronata zagotavlja globoko vlaženje, pantenol pa neguje, da se koža počuti udobno in je videti napeta, ne mastna.",
  even_tone: "Ustanovitelji in ustvarjalci, ki se vsak dan predstavljajo, začnejo svoje jutro na enak način. Neenakomerna polt je pogosta frustracija. PDRN in peptidi pomagajo spodbujati svetlejšo in živahnejšo polt, lahka formula pa se hitro in enostavno vpije, preprost korak dvakrat na dan k enakomernejšemu videzu."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Pomaga spodbujati svetlejšo in živahnejšo polt ter izboljšuje videz gladke in sijoče kože.", match: ["radiance", "pustost", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptid, ki skupaj s PDRN podpira kožo, ki je videti gladkejša in enakomernejša.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "Mešanica za vlaženje, ki privlači vlago za napet in udoben občutek ter svilnato gladko teksturo.", match: ["hydration", "suhost"] },
  { key: "panthenol", name: "Panthenol", text: "Neguje kožo in jo pusti mehko in udobno, prijazna osnova za kožo, ki zlahka reagira.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. teden, samo zvečer, vsako drugo noč", "2. teden, vsak večer", "3. do 4. teden, zjutraj in zvečer"] },
  sometimes:{ key: "standard", lines: ["1. do 3. dan, samo zvečer", "Od 4. dne naprej, zjutraj in zvečer"] },
  never:    { key: "full",     lines: ["Od 1. dne, zjutraj in zvečer, dvakrat na dan"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Vključi se takoj po čiščenju, en dodan korak, približno minuto.",
  few_products: "Nanese se po čiščenju, pred vašo vlažilno kremo.",
  full_routine: "Nanosi se v plasteh po čiščenju in pred vlažilno kremo in SPF, ničemur se ni treba odpovedati."
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
  $("#naTitle").textContent = "Niste sami. " + GOAL_LABEL[g] + " je to, kjer večina ljudi začne.";
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
    `30-dnevni načrt za ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} koža, glavna težava ${CONCERN_LABEL[a.concern]}. ` +
    `Uvajanje: ${ramp.key} (${ramp.lines.join("; ")}). Nanašajte ob ${fmtTime(a.amTime)} in ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} koža · osredotočenost na ${CONCERN_LABEL[a.concern]} · cilj: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Uvajanje</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Vaši časi</span><span class="v">${fmtTime(a.amTime)} in ${fmtTime(a.pmTime)}, opomniki samo takrat</span></div>
    <div class="planrow"><span class="k">Prileganje rutini</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Steklenička</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), velikost za uporabo dvakrat na dan</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Začnite mojo naročnino" : "Kupite enkrat") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Naročnina se obnovi vsakih 30 dni za $39. Kadar koli prekinite ali prekličete."
    : "Enkratni nakup za $49. Brez naročnine.";
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
  if (!s.firstName) missing.push("ime");
  if (!s.lastName) missing.push("priimek");
  if (!s.address1) missing.push("ulični naslov");
  if (!s.city) missing.push("mesto");
  if (!s.stateCode) missing.push("zvezna država");
  if (!s.zip) missing.push("poštna številka ZIP");
  if (!p.email) missing.push("e-pošta");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Skoraj ste tam, dodajte svoje " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Oddajanje vašega naročila …";

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
      btn.textContent = "Vodimo vas na varno blagajno …";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Pri oddaji vašega naročila je nekaj šlo narobe, vaši podatki so še tukaj, poskusite znova. Če še naprej odpoveduje, pišite na talia@tavalabs.app in uredili bomo.";
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
    <h3>Povzetek naročila</h3>
    <div class="planrow"><span class="k">Izdelek</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Dostava na</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Vaš načrt</span><span class="v">${plan.rampLines.join(" · ")}<br>Opomniki ob ${fmtTime(p.answers.amTime)} in ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Načrt poslan na</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `V aplikacijo se prijavite z ${p.email}, istim e-poštnim naslovom, ki ste ga uporabili tukaj, in vaši odgovori, vaš 30-dnevni načrt in to naročilo so že tam. Nič ni treba ponovno vnašati.`;
}

syncBuyButton();
show(0, false);
