
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

const GOAL_LABEL = { radiance: "een huid die er helderder uitziet", fine_lines: "fijne lijntjes", hydration: "diepe hydratatie", even_tone: "een egale teint" };
const SKIN_LABEL = { dry: "Droog", oily: "Vettig", combination: "Gecombineerd", sensitive: "Gevoelig", not_sure: "Ik ben er nog achter aan het komen" };
const CONCERN_LABEL = { dullness: "dofheid", fine_lines: "fijne lijntjes", uneven_tone: "ongelijke teint", texture: "ruwe textuur", dryness: "droogheid" };

const NOT_ALONE = {
  radiance: "Oprichters en makers die zichzelf elke dag presenteren, beginnen hun ochtend op dezelfde manier. Een doffe, vermoeid ogende huid is een van de meest voorkomende redenen waarom mensen met een serumroutine beginnen. Het PDRN Brightening Serum is opgebouwd rond PDRN en peptiden, in een lichte formule die de huid er glad en helder uit helpt zien, 's ochtends en 's avonds.",
  fine_lines: "Oprichters en makers die zichzelf elke dag presenteren, beginnen hun ochtend op dezelfde manier. Fijne lijntjes zijn meestal het eerste waar mensen een serum voor willen. Deze formule combineert acetyl hexapeptide-8 met PDRN, twee ingrediënten gekozen om een huid te ondersteunen die er gladder en helderder uitziet, in één enkele stap, twee keer per dag. Geen routine van tien stappen nodig.",
  hydration: "Oprichters en makers die zichzelf elke dag presenteren, beginnen hun ochtend op dezelfde manier. Een huid die tegen het middaguur strak en droog aanvoelt, is precies waar dit serum voor is gemaakt. Een mix van glycerine, sodium PCA en natriumhyaluronaat zorgt voor diepe hydratatie, terwijl panthenol de huid verzorgt, zodat ze comfortabel en gehydrateerd aanvoelt, niet vet.",
  even_tone: "Oprichters en makers die zichzelf elke dag presenteren, beginnen hun ochtend op dezelfde manier. Een teint die er ongelijk uitziet, is een veelvoorkomende frustratie. PDRN en peptiden helpen de huid er helderder en egaler uit te zien, en de lichte formule trekt snel in, in één eenvoudige stap twee keer per dag."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Helpt de huid er helderder, egaler en glad uit te zien.", match: ["radiance", "dofheid", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Een peptide dat samen met PDRN werkt om een huid te ondersteunen die er gladder en egaler uitziet.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronzuur, glycerine en natrium PCA", text: "Een hydraterende mix die vocht aantrekt, voor een huid die comfortabel en glad aanvoelt.", match: ["hydration", "droogheid"] },
  { key: "panthenol", name: "Panthenol", text: "Verzorgt de huid en laat haar zacht en comfortabel aanvoelen, een milde basis voor een huid die snel reageert.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Week 1, alleen ’s avonds, om de andere avond", "Week 2, elke avond", "Week 3–4, ochtend en avond"] },
  sometimes:{ key: "standard", lines: ["Dag 1–3, alleen ’s avonds", "Vanaf dag 4, ochtend en avond"] },
  never:    { key: "full",     lines: ["Vanaf dag 1, ochtend en avond, twee keer per dag"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Past direct na het reinigen, één extra stap, ongeveer een minuut.",
  few_products: "Gaat erop na het reinigen, vóór je moisturizer.",
  full_routine: "Komt na het reinigen en vóór moisturizer en SPF, niets om op te geven."
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
  $("#naTitle").textContent = "Je bent niet alleen. " + GOAL_LABEL[g] + " is waar de meeste mensen beginnen.";
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
    `Plan van 30 dagen voor ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} huid, belangrijkste zorg ${CONCERN_LABEL[a.concern]}. ` +
    `Opbouw: ${ramp.key} (${ramp.lines.join("; ")}). Breng aan om ${fmtTime(a.amTime)} en ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} huid · focus op ${CONCERN_LABEL[a.concern]} · doel: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Opbouw</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Jouw tijden</span><span class="v">${fmtTime(a.amTime)} en ${fmtTime(a.pmTime)}, alleen dan herinneringen</span></div>
    <div class="planrow"><span class="k">Routinefit</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">De fles</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), bemeten voor gebruik twee keer per dag</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Start mijn abonnement" : "Koop eenmalig") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Het abonnement verlengt elke 30 dagen voor $39. Pauzeer of annuleer wanneer je wilt."
    : "Eenmalige aankoop van $49. Geen abonnement.";
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
  if (!s.firstName) missing.push("voornaam");
  if (!s.lastName) missing.push("achternaam");
  if (!s.address1) missing.push("straatadres");
  if (!s.city) missing.push("plaats");
  if (!s.stateCode) missing.push("staat");
  if (!s.zip) missing.push("postcode");
  if (!p.email) missing.push("e-mail");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Bijna klaar, voeg je toe " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Je bestelling plaatsen…";

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
      btn.textContent = "Je wordt naar veilig afrekenen gebracht…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Er ging iets mis bij het plaatsen van je bestelling, je gegevens staan er nog, probeer het opnieuw. Blijft het mislukken, mail dan naar talia@tavalabs.app en wij lossen het op.";
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
    <h3>Besteloverzicht</h3>
    <div class="planrow"><span class="k">Product</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Verzenden naar</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Je plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Herinneringen om ${fmtTime(p.answers.amTime)} en ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan verzonden naar</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Log in de app in met ${p.email}, hetzelfde e-mailadres dat je hier gebruikte, en je antwoorden, je plan van 30 dagen en deze bestelling staan er al. Niets opnieuw te typen.`;
}

syncBuyButton();
show(0, false);
