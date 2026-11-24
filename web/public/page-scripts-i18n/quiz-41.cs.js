
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

const GOAL_LABEL = { radiance: "jasnější vypadající pleť", fine_lines: "jemné linky", hydration: "hloubková hydratace", even_tone: "rovnoměrný tón" };
const SKIN_LABEL = { dry: "Suchá", oily: "Mastná", combination: "Smíšená", sensitive: "Citlivá", not_sure: "Zatím to zjišťuji" };
const CONCERN_LABEL = { dullness: "mdlý vzhled", fine_lines: "jemné linky", uneven_tone: "nerovnoměrný tón", texture: "hrubá textura", dryness: "suchost" };

const NOT_ALONE = {
  radiance: "Zakladatelé a tvůrci, kteří se prezentují každý den, začínají své ráno stejným způsobem. Matná, unaveně vypadající pleť je jedním z nejčastějších důvodů, proč lidé začínají rutinu se sérem. PDRN Brightening Serum je postaveno na PDRN a peptidech, v lehkém složení, které pomáhá pleti vypadat hladká a jasná, ráno a večer.",
  fine_lines: "Zakladatelé a tvůrci, kteří se prezentují každý den, začínají své ráno stejným způsobem. Jemné linky jsou obvykle první věcí, pro kterou lidé sérum chtějí. Toto složení spojuje acetyl hexapeptide-8 s PDRN, dvě složky vybrané pro podporu pleti, která vypadá hladší a jasnější, v jediném kroku, dvakrát denně. Není potřeba rutina o deseti krocích.",
  hydration: "Zakladatelé a tvůrci, kteří se prezentují každý den, začínají své ráno stejným způsobem. Pleť, která je v poledne napjatá a suchá, je přesně to, pro co je toto sérum vyrobeno. Směs glycerinu, sodium PCA a sodium hyaluronate poskytuje hlubokou hydrataci, zatímco panthenol pečuje o pleť, takže je příjemná a hydratovaná, ne mastná.",
  even_tone: "Zakladatelé a tvůrci, kteří se prezentují každý den, začínají své ráno stejným způsobem. Pleť s nerovnoměrným vzhledem je častou frustrací. PDRN a peptidy pomáhají pleti vypadat jasnější a rovnoměrnější a lehké složení se rychle vstřebává, v jednoduchém kroku používaném dvakrát denně."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Pomáhá pleti vypadat jasnější, rovnoměrnější a hladší.", match: ["radiance", "mdlý vzhled", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptid, který spolupracuje s PDRN na podpoře pleti, která vypadá hladší a rovnoměrnější.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Kyselina hyaluronová, glycerin a sodium PCA", text: "Hydratační směs, která přitahuje vlhkost, pro pleť, která je příjemná a hladká.", match: ["hydration", "suchost"] },
  { key: "panthenol", name: "Panthenol", text: "Pečuje o pleť a zanechává ji jemnou a příjemnou, šetrný základ pro pleť, která snadno reaguje.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. týden, jen večer, každý druhý večer", "2. týden, každý večer", "Týdny 3 až 4, ráno a večer"] },
  sometimes:{ key: "standard", lines: ["Dny 1 až 3, jen večer", "Od 4. dne, ráno a večer"] },
  never:    { key: "full",     lines: ["Od 1. dne, ráno a večer, dvakrát denně"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Zapadne hned po vyčištění, jeden krok navíc, asi minuta.",
  few_products: "Nanášejte po vyčištění, před hydratačním krémem.",
  full_routine: "Vrství se po vyčištění a před hydratačním krémem a SPF, nic nemusíte vynechat."
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
  $("#naTitle").textContent = "Nejste v tom sami. " + GOAL_LABEL[g] + " je místo, kde většina lidí začíná.";
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
    `30denní plán pro ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} pleť, hlavní potíž ${CONCERN_LABEL[a.concern]}. ` +
    `Náběh: ${ramp.key} (${ramp.lines.join("; ")}). Aplikujte v ${fmtTime(a.amTime)} a ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} pleť · zaměření na ${CONCERN_LABEL[a.concern]} · cíl: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Náběh</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Vaše časy</span><span class="v">${fmtTime(a.amTime)} a ${fmtTime(a.pmTime)}, připomenutí jen tehdy</span></div>
    <div class="planrow"><span class="k">Jak sedí do rutiny</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Lahvička</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimenzovaná na použití dvakrát denně</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Zahájit mé předplatné" : "Koupit jednou") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Předplatné se obnovuje každých 30 dní za $39. Kdykoli lze pozastavit nebo zrušit."
    : "Jednorázový nákup za $49. Žádné předplatné.";
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
  if (!s.firstName) missing.push("jméno");
  if (!s.lastName) missing.push("příjmení");
  if (!s.address1) missing.push("ulice a číslo popisné");
  if (!s.city) missing.push("město");
  if (!s.stateCode) missing.push("stát");
  if (!s.zip) missing.push("PSČ");
  if (!p.email) missing.push("e-mail");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Už skoro, doplňte své " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Odesílání vaší objednávky…";

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
      btn.textContent = "Přesouváme vás k bezpečné pokladně…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Při odesílání vaší objednávky se něco pokazilo, vaše údaje tu stále jsou, zkuste to prosím znovu. Pokud to bude dál selhávat, napište na talia@tavalabs.app a my to vyřešíme.";
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
    <h3>Shrnutí objednávky</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Odesílá se na</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Váš plán</span><span class="v">${plan.rampLines.join(" · ")}<br>Připomenutí v ${fmtTime(p.answers.amTime)} a ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plán odeslán na</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Přihlaste se do aplikace pomocí ${p.email}, stejného e-mailu, který jste použili tady, a vaše odpovědi, váš 30denní plán i tato objednávka už tam jsou. Nic nemusíte přepisovat.`;
}

syncBuyButton();
show(0, false);
