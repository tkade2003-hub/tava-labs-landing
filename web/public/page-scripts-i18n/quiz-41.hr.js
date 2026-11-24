
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

const GOAL_LABEL = { radiance: "koža svjetlijeg izgleda", fine_lines: "fine linije", hydration: "dubinska hidratacija", even_tone: "ujednačen ton" };
const SKIN_LABEL = { dry: "Suha", oily: "Masna", combination: "Mješovita", sensitive: "Osjetljiva", not_sure: "Još uvijek otkrivam" };
const CONCERN_LABEL = { dullness: "beživotnost", fine_lines: "fine linije", uneven_tone: "neujednačen ton", texture: "gruba tekstura", dryness: "suhoća" };

const NOT_ALONE = {
  radiance: "Osnivači i kreatori koji se predstavljaju svaki dan započinju jutro na isti način. Beživotna koža umornog izgleda jedan je od najčešćih razloga zašto ljudi započinju rutinu seruma. PDRN Brightening Serum izgrađen je oko PDRN-a i peptida, u laganoj formuli koja pomaže koži da izgleda glatko i svijetlo, ujutro i navečer.",
  fine_lines: "Osnivači i kreatori koji se predstavljaju svaki dan započinju jutro na isti način. Fine linije obično su prva stvar za koju ljudi žele serum. Ova formula spaja acetil heksapeptid-8 s PDRN-om, dva sastojka odabrana za potporu koži koja izgleda glađe i svjetlije, u jednom koraku, dvaput dnevno. Nije potrebna rutina od deset koraka.",
  hydration: "Osnivači i kreatori koji se predstavljaju svaki dan započinju jutro na isti način. Koža koja se do podneva osjeća zategnuto i suho upravo je ono za što je ovaj serum napravljen. Mješavina glicerina, natrijevog PCA i natrijevog hijaluronata pruža duboku hidrataciju, dok pantenol njeguje kožu, pa se osjeća ugodno i hidratizirano, a ne masno.",
  even_tone: "Osnivači i kreatori koji se predstavljaju svaki dan započinju jutro na isti način. Ten neujednačenog izgleda česta je frustracija. PDRN i peptidi pomažu koži da izgleda svjetlije i ujednačenije, a lagana formula brzo se upija, u jednostavnom koraku koji se koristi dvaput dnevno."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Pomaže koži da izgleda svjetlije, ujednačenije i glatko.", match: ["radiance", "beživotnost", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptid koji djeluje uz PDRN kako bi podržao kožu glađeg i ujednačenijeg izgleda.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hijaluronska kiselina, glicerin i sodium PCA", text: "Mješavina za hidrataciju koja privlači vlagu, za kožu koja se osjeća ugodno i glatko.", match: ["hydration", "suhoća"] },
  { key: "panthenol", name: "Panthenol", text: "Njeguje kožu, ostavljajući je mekom i ugodnom, nježna baza za kožu koja lako reagira.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. tjedan, samo navečer, svaku drugu večer", "2. tjedan, svaku večer", "3. do 4. tjedan, ujutro i navečer"] },
  sometimes:{ key: "standard", lines: ["Dani 1 do 3, samo navečer", "Od 4. dana nadalje, ujutro i navečer"] },
  never:    { key: "full",     lines: ["Od 1. dana, ujutro i navečer, dvaput dnevno"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Uklapa se odmah nakon čišćenja, jedan dodani korak, oko minutu.",
  few_products: "Nanosi se nakon čišćenja, prije vaše hidratantne kreme.",
  full_routine: "Nanosi se u sloju nakon čišćenja i prije hidratantne kreme i SPF, ničega se ne morate odreći."
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
  $("#naTitle").textContent = "Niste sami. " + GOAL_LABEL[g] + " je mjesto od kojeg većina ljudi počinje.";
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
    `Plan od 30 dana za ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} koža, glavna tegoba ${CONCERN_LABEL[a.concern]}. ` +
    `Postupno uvođenje: ${ramp.key} (${ramp.lines.join("; ")}). Nanesite u ${fmtTime(a.amTime)} i ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} koža · fokus na ${CONCERN_LABEL[a.concern]} · cilj: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Postupno uvođenje</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Vaša vremena</span><span class="v">${fmtTime(a.amTime)} i ${fmtTime(a.pmTime)}, podsjetnici samo tada</span></div>
    <div class="planrow"><span class="k">Uklapanje u rutinu</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Bočica</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), veličina za uporabu dvaput dnevno</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Započnite moju pretplatu" : "Kupite jednom") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Pretplata se obnavlja svakih 30 dana po $39. Pauzirajte ili otkažite u bilo kojem trenutku."
    : "Jednokratna kupnja od $49. Bez pretplate.";
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
  if (!s.lastName) missing.push("prezime");
  if (!s.address1) missing.push("adresa ulice");
  if (!s.city) missing.push("grad");
  if (!s.stateCode) missing.push("savezna država");
  if (!s.zip) missing.push("poštanski broj");
  if (!p.email) missing.push("e pošta");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Još malo, dodajte svoje " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Slanje vaše narudžbe…";

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
      btn.textContent = "Vodimo vas na sigurnu naplatu…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Nešto je pošlo po zlu pri slanju vaše narudžbe, vaši podaci su i dalje ovdje, pokušajte ponovno. Ako i dalje ne uspijeva, pišite na support@tavalabs.app i mi ćemo to riješiti.";
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
    <h3>Sažetak narudžbe</h3>
    <div class="planrow"><span class="k">Proizvod</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Dostava na</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Vaš plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Podsjetnici u ${fmtTime(p.answers.amTime)} i ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan poslan na</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Prijavite se u aplikaciju adresom ${p.email}, istom adresom e pošte koju ste ovdje koristili, i vaši odgovori, vaš plan od 30 dana i ova narudžba već su tamo. Ništa ne treba ponovno upisivati.`;
}

syncBuyButton();
show(0, false);
