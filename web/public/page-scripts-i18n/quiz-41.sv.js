
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

const GOAL_LABEL = { radiance: "hud som ser ljusare ut", fine_lines: "fina linjer", hydration: "djup återfuktning", even_tone: "en jämn ton" };
const SKIN_LABEL = { dry: "Torr", oily: "Fet", combination: "Kombinerad", sensitive: "Känslig", not_sure: "Håller fortfarande på att komma på det" };
const CONCERN_LABEL = { dullness: "matthet", fine_lines: "fina linjer", uneven_tone: "ojämn ton", texture: "grov textur", dryness: "torrhet" };

const NOT_ALONE = {
  radiance: "Grundare och kreatörer som presenterar sig varje dag börjar sin morgon på samma sätt. Matt, trött hud är en av de vanligaste anledningarna till att människor börjar en serumrutin. PDRN Brightening Serum är byggt kring PDRN och peptider, i en lätt formel som hjälper huden att se slät och ljus ut, morgon och kväll.",
  fine_lines: "Grundare och kreatörer som presenterar sig varje dag börjar sin morgon på samma sätt. Fina linjer är vanligtvis det första människor vill ha ett serum för. Denna formel kombinerar acetyl hexapeptide-8 med PDRN, två ingredienser valda för att stödja hud som ser slätare och ljusare ut, i ett enda steg, två gånger om dagen. Ingen rutin i tio steg krävs.",
  hydration: "Grundare och kreatörer som presenterar sig varje dag börjar sin morgon på samma sätt. Hud som känns stram och torr vid middagstid är precis vad detta serum är gjort för. En blandning av glycerin, natrium PCA och natriumhyaluronat ger djup återfuktning, medan panthenol vårdar huden, så att den känns bekväm och återfuktad, inte fet.",
  even_tone: "Grundare och kreatörer som presenterar sig varje dag börjar sin morgon på samma sätt. En ojämn hudton är en vanlig frustration. PDRN och peptider hjälper huden att se ljusare och jämnare ut, och den lätta formeln absorberas snabbt, i ett enkelt steg som används två gånger om dagen."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Hjälper huden att se ljusare, jämnare och slät ut.", match: ["radiance", "matthet", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "En peptid som arbetar tillsammans med PDRN för att stödja hud som ser slätare och jämnare ut.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronsyra, glycerin och sodium PCA", text: "En återfuktningsblandning som drar in fukt, för hud som känns bekväm och slät.", match: ["hydration", "torrhet"] },
  { key: "panthenol", name: "Panthenol", text: "Vårdar huden och lämnar den mjuk och bekväm, en skonsam bas för hud som reagerar lätt.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Vecka 1, endast kvällar, varannan kväll", "Vecka 2, varje kväll", "Vecka 3–4, morgon och kväll"] },
  sometimes:{ key: "standard", lines: ["Dag 1–3, endast kvällar", "Från dag 4, morgon och kväll"] },
  never:    { key: "full",     lines: ["Från dag 1, morgon och kväll, två gånger dagligen"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Passar in direkt efter rengöring, ett tillagt steg, cirka en minut.",
  few_products: "Appliceras efter rengöring, före din fuktkräm.",
  full_routine: "Läggs i lager efter rengöring och före fuktkräm och SPF, inget att ge upp."
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
  $("#naTitle").textContent = "Du är inte ensam. " + GOAL_LABEL[g] + " är där de flesta börjar.";
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
    `30 dagars plan för ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} hud, främsta bekymmer ${CONCERN_LABEL[a.concern]}. ` +
    `Upptrappning: ${ramp.key} (${ramp.lines.join("; ")}). Applicera kl. ${fmtTime(a.amTime)} och ${fmtTime(a.pmTime)}. ` +
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
    <div class="planrow"><span class="k">Upptrappning</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Dina tider</span><span class="v">${fmtTime(a.amTime)} och ${fmtTime(a.pmTime)}, påminnelser endast då</span></div>
    <div class="planrow"><span class="k">Passar rutinen</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Flaskan</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), i storlek för användning två gånger dagligen</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Starta min prenumeration" : "Köp en gång") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Prenumerationen förnyas var 30:e dag för $39. Pausa eller avbryt när som helst."
    : "Engångsköp för $49. Ingen prenumeration.";
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
  if (!s.firstName) missing.push("förnamn");
  if (!s.lastName) missing.push("efternamn");
  if (!s.address1) missing.push("gatuadress");
  if (!s.city) missing.push("stad");
  if (!s.stateCode) missing.push("delstat");
  if (!s.zip) missing.push("ZIP kod");
  if (!p.email) missing.push("mejl");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Nästan klart, lägg till " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Lägger din beställning…";

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
      btn.textContent = "Tar dig till säker kassa…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Något gick fel när din beställning lades, dina uppgifter finns fortfarande här, försök igen. Om det fortsätter att misslyckas, mejla talia@tavalabs.app så löser vi det.";
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
    <h3>Beställningssammanfattning</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Skickas till</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Din plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Påminnelser kl. ${fmtTime(p.answers.amTime)} och ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan skickad till</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Logga in i appen med ${p.email}, samma mejladress som du använde här, så finns dina svar, din 30 dagars plan och denna beställning redan där. Inget att skriva om.`;
}

syncBuyButton();
show(0, false);
