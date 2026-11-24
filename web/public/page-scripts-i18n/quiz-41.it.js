
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

const GOAL_LABEL = { radiance: "luminosità e splendore", fine_lines: "linee sottili", hydration: "idratazione profonda", even_tone: "un colorito uniforme" };
const SKIN_LABEL = { dry: "Secca", oily: "Grassa", combination: "Mista", sensitive: "Sensibile", not_sure: "Lo sto ancora capendo" };
const CONCERN_LABEL = { dullness: "opacità", fine_lines: "linee sottili", uneven_tone: "colorito irregolare", texture: "texture ruvida", dryness: "secchezza" };

const NOT_ALONE = {
  radiance: "Fondatori e creatori che si presentano ogni giorno iniziano la mattina allo stesso modo. Una pelle spenta e dall'aspetto stanco è uno dei motivi più comuni per iniziare una routine con un siero. Il PDRN Brightening Serum è costruito intorno a PDRN e peptidi, in una formula leggera pensata per migliorare l'aspetto di una pelle liscia e luminosa, lasciandola dall'aspetto rimpolpato, morbido e fresco, mattina e sera.",
  fine_lines: "Fondatori e creatori che si presentano ogni giorno iniziano la mattina allo stesso modo. Le linee sottili sono di solito la prima cosa per cui le persone cercano un siero. Questa formula unisce acetyl hexapeptide-8 e PDRN, ingredienti scelti per sostenere una pelle dall'aspetto più liscio e luminoso, in un unico gesto, due volte al giorno. Nessuna routine in dieci passi necessaria.",
  hydration: "Fondatori e creatori che si presentano ogni giorno iniziano la mattina allo stesso modo. Una pelle che tira e ha sete già a metà giornata è esattamente ciò per cui è fatto questo siero. Una miscela di glicerina, sodio PCA e ialuronato di sodio offre un'idratazione profonda, mentre il pantenolo condiziona, così la pelle si sente confortevole e appare rimpolpata, non unta.",
  even_tone: "Fondatori e creatori che si presentano ogni giorno iniziano la mattina allo stesso modo. Un colorito dall'aspetto irregolare è una frustrazione comune. PDRN e peptidi aiutano a favorire un colorito dall'aspetto più luminoso e vibrante, e la formula leggera si assorbe rapidamente e facilmente, un semplice gesto due volte al giorno verso un aspetto più uniforme."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Aiuta a favorire un colorito dall'aspetto più luminoso e vibrante e migliora l'aspetto di una pelle liscia e radiosa.", match: ["radiance", "opacità", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Un peptide che lavora insieme al PDRN per sostenere una pelle dall'aspetto più liscio e uniforme.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Acido ialuronico, glicerina e sodio PCA", text: "Una miscela idratante che attira l'acqua per una sensazione rimpolpata e confortevole e una texture setosa e liscia.", match: ["hydration", "secchezza"] },
  { key: "panthenol", name: "Pantenolo", text: "Condiziona la pelle, lasciandola morbida e confortevole, una base gentile per la pelle che reagisce facilmente.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Settimana 1 — solo la sera, a sere alterne", "Settimana 2 — ogni sera", "Settimane 3–4 — mattina e sera"] },
  sometimes:{ key: "standard", lines: ["Giorni 1–3 — solo la sera", "Dal giorno 4 in poi — mattina e sera"] },
  never:    { key: "full",     lines: ["Dal giorno 1 — mattina e sera, due volte al giorno"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Si inserisce subito dopo la detersione, un gesto in più, circa un minuto.",
  few_products: "Si applica dopo la detersione, prima della crema idratante.",
  full_routine: "Si stratifica dopo la detersione e prima di crema idratante e SPF, senza rinunciare a nulla."
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
  $("#naTitle").textContent = "Non sei solo. " + GOAL_LABEL[g] + " è il punto da cui parte la maggior parte delle persone.";
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
    `Piano di 30 giorni per ${GOAL_LABEL[a.goal]}: pelle ${SKIN_LABEL[a.skinType]}, preoccupazione principale ${CONCERN_LABEL[a.concern]}. ` +
    `Aumento graduale: ${ramp.key} (${ramp.lines.join("; ")}). Applica alle ${fmtTime(a.amTime)} e alle ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">Pelle ${SKIN_LABEL[a.skinType]} · attenzione a ${CONCERN_LABEL[a.concern]} · obiettivo: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Aumento graduale</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">I tuoi orari</span><span class="v">${fmtTime(a.amTime)} e ${fmtTime(a.pmTime)} — promemoria solo a quegli orari</span></div>
    <div class="planrow"><span class="k">Adattamento alla routine</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">La bottiglia</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml) — formato per l'uso due volte al giorno</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Avvia il mio abbonamento" : "Acquista una volta") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "L'abbonamento si rinnova ogni 30 giorni a $39. Metti in pausa o annulla in qualsiasi momento."
    : "Acquisto una tantum di $49. Nessun abbonamento.";
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
  if (!s.firstName) missing.push("nome");
  if (!s.lastName) missing.push("cognome");
  if (!s.address1) missing.push("indirizzo");
  if (!s.city) missing.push("città");
  if (!s.stateCode) missing.push("stato");
  if (!s.zip) missing.push("codice postale");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Ci siamo quasi — aggiungi " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Invio dell'ordine in corso…";

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
      btn.textContent = "Ti portiamo al pagamento sicuro…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Qualcosa è andato storto nell'invio dell'ordine — i tuoi dati sono ancora qui, riprova. Se continua a non funzionare, scrivi a talia@tavalabs.app e lo risolveremo noi.";
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
    <h3>Riepilogo dell'ordine</h3>
    <div class="planrow"><span class="k">Prodotto</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Spedizione a</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Il tuo piano</span><span class="v">${plan.rampLines.join(" · ")}<br>Promemoria alle ${fmtTime(p.answers.amTime)} e alle ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Piano inviato a</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Accedi all'app con ${p.email} — la stessa email che hai usato qui — e le tue risposte, il tuo piano di 30 giorni e questo ordine sono già lì. Nulla da ridigitare.`;
}

syncBuyButton();
show(0, false);
