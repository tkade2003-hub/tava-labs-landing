
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

const GOAL_LABEL = { radiance: "piele care arată mai luminoasă", fine_lines: "linii fine", hydration: "hidratare profundă", even_tone: "un ton uniform" };
const SKIN_LABEL = { dry: "Uscată", oily: "Grasă", combination: "Mixtă", sensitive: "Sensibilă", not_sure: "Încă îmi dau seama" };
const CONCERN_LABEL = { dullness: "ternitatea", fine_lines: "linii fine", uneven_tone: "tonul neuniform", texture: "textura aspră", dryness: "uscăciunea" };

const NOT_ALONE = {
  radiance: "Fondatorii și creatorii care se prezintă în fiecare zi își încep dimineața în același fel. Pielea ternă, care arată obosită, este unul dintre cele mai frecvente motive pentru care oamenii încep o rutină cu ser. PDRN Brightening Serum este construit în jurul PDRN și peptidelor, într-o formulă ușoară care ajută pielea să arate netedă și luminoasă, dimineața și seara.",
  fine_lines: "Fondatorii și creatorii care se prezintă în fiecare zi își încep dimineața în același fel. Liniile fine sunt de obicei primul lucru pentru care oamenii vor un ser. Această formulă combină acetil hexapeptida-8 cu PDRN, două ingrediente alese pentru a susține o piele care arată mai netedă și mai luminoasă, într-un singur pas, de două ori pe zi. Nu este nevoie de o rutină în zece pași.",
  hydration: "Fondatorii și creatorii care se prezintă în fiecare zi își încep dimineața în același fel. Pielea care se simte strânsă și uscată până la prânz este exact pentru ce este creat acest ser. Un amestec de glicerină, sodium PCA și hialuronat de sodiu oferă hidratare profundă, în timp ce pantenolul îngrijește pielea, așa că se simte confortabilă și hidratată, nu grasă.",
  even_tone: "Fondatorii și creatorii care se prezintă în fiecare zi își încep dimineața în același fel. Un ten care arată neuniform este o frustrare frecventă. PDRN și peptidele ajută pielea să arate mai luminoasă și mai uniformă, iar formula ușoară se absoarbe rapid, într-un pas simplu folosit de două ori pe zi."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Ajută pielea să arate mai luminoasă, mai uniformă și netedă.", match: ["radiance", "ternitatea", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "O peptidă care lucrează alături de PDRN pentru a susține o piele care arată mai netedă și mai uniformă.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Acid hialuronic, glicerină și Sodium PCA", text: "Un amestec de hidratare care atrage umezeala, pentru o piele care se simte confortabilă și netedă.", match: ["hydration", "uscăciunea"] },
  { key: "panthenol", name: "Panthenol", text: "Îngrijește pielea, lăsând-o să se simtă moale și confortabilă, o bază blândă pentru pielea care reacționează ușor.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Săptămâna 1, doar seara, o dată la două nopți", "Săptămâna 2, în fiecare seară", "Săptămânile 3 și 4, dimineața și seara"] },
  sometimes:{ key: "standard", lines: ["Zilele 1 până la 3, doar seara", "Din ziua 4 înainte, dimineața și seara"] },
  never:    { key: "full",     lines: ["Din ziua 1, dimineața și seara, de două ori pe zi"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Se potrivește imediat după curățare, un pas adăugat, aproximativ un minut.",
  few_products: "Se aplică după curățare, înainte de crema ta hidratantă.",
  full_routine: "Se suprapune după curățare și înainte de crema hidratantă și SPF, fără să renunți la nimic."
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
  $("#naTitle").textContent = "Nu ești singur. " + GOAL_LABEL[g] + " este locul de unde încep majoritatea oamenilor.";
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
    `Plan de 30 de zile pentru ${GOAL_LABEL[a.goal]}: piele ${SKIN_LABEL[a.skinType]}, preocupare principală ${CONCERN_LABEL[a.concern]}. ` +
    `Creștere: ${ramp.key} (${ramp.lines.join("; ")}). Aplică la ${fmtTime(a.amTime)} și ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">Piele ${SKIN_LABEL[a.skinType]} · accent pe ${CONCERN_LABEL[a.concern]} · obiectiv: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Creștere</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Orele tale</span><span class="v">${fmtTime(a.amTime)} și ${fmtTime(a.pmTime)}, mementouri doar atunci</span></div>
    <div class="planrow"><span class="k">Potrivire cu rutina</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Sticla</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimensionată pentru folosire de două ori pe zi</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Începe abonamentul meu" : "Cumpără o dată") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Abonamentul se reînnoiește la fiecare 30 de zile la $39. Pune pe pauză sau anulează oricând."
    : "Achiziție unică de $49. Fără abonament.";
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
  if (!s.firstName) missing.push("prenume");
  if (!s.lastName) missing.push("nume de familie");
  if (!s.address1) missing.push("adresa străzii");
  if (!s.city) missing.push("oraș");
  if (!s.stateCode) missing.push("stat");
  if (!s.zip) missing.push("cod ZIP");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Aproape gata, adaugă " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Se plasează comanda ta…";

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
      btn.textContent = "Te ducem la finalizarea securizată…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Ceva nu a mers bine la plasarea comenzii tale, datele tale sunt încă aici, te rugăm să încerci din nou. Dacă continuă să eșueze, scrie la talia@tavalabs.app și rezolvăm noi.";
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
    <h3>Rezumatul comenzii</h3>
    <div class="planrow"><span class="k">Produs</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Livrare către</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Planul tău</span><span class="v">${plan.rampLines.join(" · ")}<br>Mementouri la ${fmtTime(p.answers.amTime)} și ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan trimis către</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Autentifică-te în aplicație cu ${p.email}, același email pe care l-ai folosit aici, iar răspunsurile tale, planul tău de 30 de zile și această comandă sunt deja acolo. Nu ai nimic de retastat.`;
}

syncBuyButton();
show(0, false);
