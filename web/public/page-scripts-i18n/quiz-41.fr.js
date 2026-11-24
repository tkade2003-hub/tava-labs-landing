
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

const GOAL_LABEL = { radiance: "une peau à l'aspect plus lumineux", fine_lines: "ridules", hydration: "hydratation profonde", even_tone: "un teint uniforme" };
const SKIN_LABEL = { dry: "Sèche", oily: "Grasse", combination: "Mixte", sensitive: "Sensible", not_sure: "Je suis encore en train de le découvrir" };
const CONCERN_LABEL = { dullness: "teint terne", fine_lines: "ridules", uneven_tone: "teint irrégulier", texture: "texture rugueuse", dryness: "sécheresse" };

const NOT_ALONE = {
  radiance: "Les fondateurs et les créateurs qui se présentent chaque jour commencent leur matinée de la même façon. Une peau terne et à l'air fatigué est l'une des raisons les plus fréquentes de commencer une routine de sérum. Le PDRN Brightening Serum est construit autour du PDRN et des peptides, dans une formule légère qui aide la peau à paraître lisse et lumineuse, matin et soir.",
  fine_lines: "Les fondateurs et les créateurs qui se présentent chaque jour commencent leur matinée de la même façon. Les ridules sont en général la première chose pour laquelle les gens veulent un sérum. Cette formule associe l'acetyl hexapeptide-8 au PDRN, deux ingrédients choisis pour soutenir une peau à l'aspect plus lisse et plus lumineux, en un seul geste, deux fois par jour. Aucune routine en dix étapes requise.",
  hydration: "Les fondateurs et les créateurs qui se présentent chaque jour commencent leur matinée de la même façon. Une peau qui tiraille et qui est sèche dès la mi-journée est exactement ce pour quoi ce sérum est fait. Un mélange de glycérine, de sodium PCA et de hyaluronate de sodium apporte une hydratation profonde, tandis que le panthénol nourrit la peau, pour qu'elle se sente confortable et hydratée, sans être grasse.",
  even_tone: "Les fondateurs et les créateurs qui se présentent chaque jour commencent leur matinée de la même façon. Un teint à l'aspect irrégulier est une frustration fréquente. Le PDRN et les peptides aident la peau à paraître plus lumineuse et plus uniforme, et la formule légère pénètre vite, en un geste simple deux fois par jour."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Aide la peau à paraître plus lumineuse, plus uniforme et lisse.", match: ["radiance", "teint terne", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Un peptide qui agit aux côtés du PDRN pour soutenir une peau à l'aspect plus lisse et plus uniforme.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Acide hyaluronique, glycérine et sodium PCA", text: "Un mélange hydratant qui attire l'eau, pour une peau qui se sent confortable et lisse.", match: ["hydration", "sécheresse"] },
  { key: "panthenol", name: "Panthenol", text: "Nourrit la peau et la laisse douce et confortable, une base douce pour les peaux qui réagissent facilement.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Semaine 1 : le soir uniquement, un soir sur deux", "Semaine 2 : chaque soir", "Semaines 3 et 4 : matin et soir"] },
  sometimes:{ key: "standard", lines: ["Jours 1 à 3 : le soir uniquement", "À partir du jour 4 : matin et soir"] },
  never:    { key: "full",     lines: ["Dès le jour 1 : matin et soir, deux fois par jour"] }
};

const ROUTINE_FIT = {
  cleanser_only: "S'intègre juste après le nettoyage, un geste ajouté, environ une minute.",
  few_products: "S'applique après le nettoyage, avant votre crème hydratante.",
  full_routine: "Se superpose après le nettoyage et avant la crème hydratante et le SPF, rien à abandonner."
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
  $("#naTitle").textContent = "Vous n'êtes pas seul. " + GOAL_LABEL[g] + " est le point de départ de la plupart des gens.";
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
    `Programme de 30 jours pour ${GOAL_LABEL[a.goal]} : peau ${SKIN_LABEL[a.skinType]}, préoccupation principale ${CONCERN_LABEL[a.concern]}. ` +
    `Montée en puissance : ${ramp.key} (${ramp.lines.join("; ")}). Appliquez à ${fmtTime(a.amTime)} et à ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">Peau ${SKIN_LABEL[a.skinType]} · accent sur ${CONCERN_LABEL[a.concern]} · objectif : ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Montée en puissance</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Vos horaires</span><span class="v">${fmtTime(a.amTime)} et ${fmtTime(a.pmTime)} : des rappels uniquement à ces moments là</span></div>
    <div class="planrow"><span class="k">Adaptation à la routine</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Le flacon</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimensionné pour un usage deux fois par jour</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Commencer mon abonnement" : "Acheter une fois") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "L'abonnement se renouvelle tous les 30 jours à $39. Mettez en pause ou annulez à tout moment."
    : "Achat unique de $49. Aucun abonnement.";
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
  if (!s.firstName) missing.push("prénom");
  if (!s.lastName) missing.push("nom");
  if (!s.address1) missing.push("adresse");
  if (!s.city) missing.push("ville");
  if (!s.stateCode) missing.push("état");
  if (!s.zip) missing.push("code postal");
  if (!p.email) missing.push("e mail");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Presque terminé : ajoutez votre " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Passage de votre commande…";

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
      btn.textContent = "Redirection vers le paiement sécurisé…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Une erreur s'est produite lors du passage de votre commande. Vos informations sont toujours là, veuillez réessayer. Si cela continue d'échouer, écrivez à talia@tavalabs.app et nous réglerons cela.";
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
    <h3>Récapitulatif de la commande</h3>
    <div class="planrow"><span class="k">Produit</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Livraison à</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Votre programme</span><span class="v">${plan.rampLines.join(" · ")}<br>Rappels à ${fmtTime(p.answers.amTime)} et à ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Programme envoyé à</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Connectez vous à l'application avec ${p.email}, le même e mail que celui utilisé ici, et vos réponses, votre programme de 30 jours et cette commande y sont déjà. Rien à ressaisir.`;
}

syncBuyButton();
show(0, false);
