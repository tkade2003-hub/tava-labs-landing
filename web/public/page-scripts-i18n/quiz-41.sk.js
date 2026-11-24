
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

const GOAL_LABEL = { radiance: "jasnejšia pleť na pohľad", fine_lines: "jemné vrásky", hydration: "hlboká hydratácia", even_tone: "rovnomerný tón" };
const SKIN_LABEL = { dry: "Suchá", oily: "Mastná", combination: "Zmiešaná", sensitive: "Citlivá", not_sure: "Stále na to prichádzam" };
const CONCERN_LABEL = { dullness: "mdlosť", fine_lines: "jemné vrásky", uneven_tone: "nerovnomerný tón", texture: "drsná textúra", dryness: "suchosť" };

const NOT_ALONE = {
  radiance: "Zakladatelia a tvorcovia, ktorí sa prezentujú každý deň, začínajú svoje ráno rovnako. Matná, unavená pleť na pohľad je jedným z najbežnejších dôvodov, prečo ľudia začínajú rutinu so sérom. PDRN Brightening Serum je postavený okolo PDRN a peptidov, v ľahkej formule, ktorá pomáha pleti vyzerať hladko a jasne, ráno a večer.",
  fine_lines: "Zakladatelia a tvorcovia, ktorí sa prezentujú každý deň, začínajú svoje ráno rovnako. Jemné vrásky sú zvyčajne prvá vec, na ktorú ľudia chcú sérum. Táto formula spája acetyl hexapeptid-8 s PDRN, dve zložky vybrané na podporu pleti, ktorá vyzerá hladšie a jasnejšie, v jednom kroku, dvakrát denne. Nie je potrebná rutina o desiatich krokoch.",
  hydration: "Zakladatelia a tvorcovia, ktorí sa prezentujú každý deň, začínajú svoje ráno rovnako. Pleť, ktorá je do poludnia napnutá a suchá na pocit, je presne to, na čo je toto sérum vyrobené. Zmes glycerínu, sodium PCA a sodium hyaluronátu poskytuje hĺbkovú hydratáciu, zatiaľ čo pantenol pleť kondicionuje, takže je príjemná a hydratovaná na pocit, nie mastná.",
  even_tone: "Zakladatelia a tvorcovia, ktorí sa prezentujú každý deň, začínajú svoje ráno rovnako. Nerovnomerná pleť na pohľad je bežná frustrácia. PDRN a peptidy pomáhajú pleti vyzerať jasnejšie a rovnomernejšie a ľahká formula sa rýchlo vstrebáva, v jednoduchom kroku používanom dvakrát denne."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Pomáha pleti vyzerať jasnejšie, rovnomernejšie a hladšie.", match: ["radiance", "mdlosť", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptid, ktorý pracuje spolu s PDRN na podporu pleti, ktorá vyzerá hladšie a rovnomernejšie.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Kyselina hyalurónová, glycerín a Sodium PCA", text: "Hydratačná zmes, ktorá priťahuje vlhkosť, pre pleť, ktorá je príjemná a hladká na pocit.", match: ["hydration", "suchosť"] },
  { key: "panthenol", name: "Panthenol", text: "Kondicionuje pleť a zanecháva ju jemnú a príjemnú na pocit, jemný základ pre pleť, ktorá ľahko reaguje.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. týždeň, iba večer, každú druhú noc", "2. týždeň, každý večer", "Týždne 3 až 4, ráno a večer"] },
  sometimes:{ key: "standard", lines: ["Dni 1 až 3, iba večer", "Od 4. dňa, ráno a večer"] },
  never:    { key: "full",     lines: ["Od 1. dňa, ráno a večer, dvakrát denne"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Zaradí sa hneď po vyčistení, jeden pridaný krok, asi minúta.",
  few_products: "Ide po vyčistení, pred vaším hydratačným krémom.",
  full_routine: "Vrství sa po vyčistení a pred hydratačným krémom a SPF, ničoho sa netreba vzdať."
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
  $("#naTitle").textContent = "Nie ste v tom sami. " + GOAL_LABEL[g] + " je miesto, kde väčšina ľudí začína.";
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
    `30-dňový plán pre ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} pleť, hlavná obava ${CONCERN_LABEL[a.concern]}. ` +
    `Navykanie: ${ramp.key} (${ramp.lines.join("; ")}). Nanášajte o ${fmtTime(a.amTime)} a ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} pleť · zameranie na ${CONCERN_LABEL[a.concern]} · cieľ: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Navykanie</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Vaše časy</span><span class="v">${fmtTime(a.amTime)} a ${fmtTime(a.pmTime)}, pripomienky iba vtedy</span></div>
    <div class="planrow"><span class="k">Zaradenie do rutiny</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Fľaštička</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimenzovaná na používanie dvakrát denne</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Začať moje predplatné" : "Kúpiť raz") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Predplatné sa obnovuje každých 30 dní za $39. Kedykoľvek pozastavte alebo zrušte."
    : "Jednorazový nákup za $49. Žiadne predplatné.";
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
  if (!s.firstName) missing.push("meno");
  if (!s.lastName) missing.push("priezvisko");
  if (!s.address1) missing.push("adresu ulice");
  if (!s.city) missing.push("mesto");
  if (!s.stateCode) missing.push("štát");
  if (!s.zip) missing.push("PSČ");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Už skoro, pridajte svoje " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Odosiela sa vaša objednávka…";

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
      btn.textContent = "Prechádzate do bezpečnej pokladne…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Pri odosielaní vašej objednávky sa niečo pokazilo, vaše údaje sú stále tu, skúste to prosím znova. Ak to naďalej zlyháva, napíšte na support@tavalabs.app a my to vyriešime.";
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
    <h3>Zhrnutie objednávky</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Doručuje sa</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Váš plán</span><span class="v">${plan.rampLines.join(" · ")}<br>Pripomienky o ${fmtTime(p.answers.amTime)} a ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plán odoslaný na</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Prihláste sa do aplikácie emailom ${p.email}, rovnakým emailom, aký ste použili tu, a vaše odpovede, váš 30-dňový plán a táto objednávka sú už tam. Nič netreba prepisovať.`;
}

syncBuyButton();
show(0, false);
