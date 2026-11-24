
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

const GOAL_LABEL = { radiance: "ragyogás és kisugárzás", fine_lines: "finom vonalak", hydration: "mély hidratálás", even_tone: "egyenletes tónus" };
const SKIN_LABEL = { dry: "Száraz", oily: "Zsíros", combination: "Kombinált", sensitive: "Érzékeny", not_sure: "Még nem tudom biztosan" };
const CONCERN_LABEL = { dullness: "fakóság", fine_lines: "finom vonalak", uneven_tone: "egyenetlen tónus", texture: "durva textúra", dryness: "szárazság" };

const NOT_ALONE = {
  radiance: "Az alapítók és alkotók, akik minden nap bemutatkoznak, ugyanúgy kezdik a reggelüket. A fakó, fáradtnak tűnő bőr az egyik leggyakoribb ok, amiért az emberek szérumrutint kezdenek. A PDRN Brightening Serum a PDRN és a peptidek köré épül, könnyű formulában, amely a sima, ragyogó bőr látszatát hivatott javítani, és a bőrt teltnek, puhának és felfrissültnek mutatja, reggel és este.",
  fine_lines: "Az alapítók és alkotók, akik minden nap bemutatkoznak, ugyanúgy kezdik a reggelüket. A finom vonalak általában az első dolog, amiért az emberek szérumot szeretnének. Ez a formula az Acetyl Hexapeptide-8 összetevőt párosítja a PDRN-nel, olyan összetevőket, amelyeket azért választottak, hogy támogassák a simábbnak és ragyogóbbnak tűnő bőrt, egyetlen lépésben, naponta kétszer. Nincs szükség tízlépéses rutinra.",
  hydration: "Az alapítók és alkotók, akik minden nap bemutatkoznak, ugyanúgy kezdik a reggelüket. A bőr, amely délre feszesnek és szomjasnak érzi magát, pontosan az, amire ez a szérum készült. A Glycerin, a Sodium PCA és a Sodium Hyaluronate keveréke mély hidratálást nyújt, miközben a Panthenol ápol, így a bőr kényelmesnek érzi magát, és teltnek tűnik, nem zsírosnak.",
  even_tone: "Az alapítók és alkotók, akik minden nap bemutatkoznak, ugyanúgy kezdik a reggelüket. Az egyenetlennek tűnő arcszín gyakori frusztráció. A PDRN és a peptidek segítenek előmozdítani a ragyogóbb, élénkebbnek tűnő arcszínt, és a könnyű formula gyorsan és könnyen beszívódik, egyszerű lépés naponta kétszer az egyenletesebb megjelenés felé."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Segít előmozdítani a ragyogóbb, élénkebbnek tűnő arcszínt, és javítja a sima, ragyogó bőr látszatát.", match: ["radiance", "fakóság", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptid, amely a PDRN mellett dolgozik, hogy támogassa a simábbnak és egyenletesebbnek tűnő bőrt.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hialuronsav, Glycerin és Sodium PCA", text: "Hidratáló keverék, amely magához vonzza a nedvességet a telt, kényelmes érzetért és a selymesen sima textúráért.", match: ["hydration", "szárazság"] },
  { key: "panthenol", name: "Panthenol", text: "Ápolja a bőrt, puhának és kényelmesnek hagyja, kíméletes alap a könnyen reagáló bőrnek.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. hét, csak esténként, minden második este", "2. hét, minden este", "3. és 4. hét, reggel és este"] },
  sometimes:{ key: "standard", lines: ["1, 3. nap, csak esténként", "A 4. naptól, reggel és este"] },
  never:    { key: "full",     lines: ["Az 1. naptól, reggel és este, naponta kétszer"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Közvetlenül a tisztítás után illeszkedik, egy plusz lépés, körülbelül egy perc.",
  few_products: "A tisztítás után kerül fel, a hidratálód előtt.",
  full_routine: "A tisztítás után rétegeződik, a hidratáló és az SPF előtt, semmiről nem kell lemondanod."
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
  $("#naTitle").textContent = "Nem vagy egyedül. " + GOAL_LABEL[g] + " az a pont, ahol a legtöbben kezdik.";
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
    `30 napos terv ehhez: ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} bőr, fő probléma: ${CONCERN_LABEL[a.concern]}. ` +
    `Felépítés: ${ramp.key} (${ramp.lines.join("; ")}). Alkalmazás ekkor: ${fmtTime(a.amTime)} és ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} bőr · fókusz: ${CONCERN_LABEL[a.concern]} · cél: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Felépítés</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Az időpontjaid</span><span class="v">${fmtTime(a.amTime)} és ${fmtTime(a.pmTime)}, emlékeztetők csak akkor</span></div>
    <div class="planrow"><span class="k">Illeszkedés a rutinhoz</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Az üveg</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), napi kétszeri használatra méretezve</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Előfizetés indítása" : "Egyszeri vásárlás") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Az előfizetés 30 naponta megújul $39 áron. Bármikor szüneteltethető vagy lemondható."
    : "Egyszeri vásárlás $49 áron. Nincs előfizetés.";
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
  if (!s.firstName) missing.push("keresztnév");
  if (!s.lastName) missing.push("vezetéknév");
  if (!s.address1) missing.push("utca és házszám");
  if (!s.city) missing.push("város");
  if (!s.stateCode) missing.push("állam");
  if (!s.zip) missing.push("ZIP kód");
  if (!p.email) missing.push("e-mail");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Már majdnem kész, add meg: " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "A rendelésed leadása…";

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
      btn.textContent = "Átirányítunk a biztonságos fizetéshez…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Valami hiba történt a rendelésed leadásakor, az adataid még itt vannak, próbáld újra. Ha továbbra sem sikerül, írj a talia@tavalabs.app címre, és elintézzük.";
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
    <h3>Rendelés összefoglaló</h3>
    <div class="planrow"><span class="k">Termék</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Szállítás ide</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">A terved</span><span class="v">${plan.rampLines.join(" · ")}<br>Emlékeztetők ekkor: ${fmtTime(p.answers.amTime)} és ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Terv elküldve ide</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Jelentkezz be az alkalmazásba ezzel: ${p.email}, ugyanazzal az e-mail címmel, amelyet itt használtál, és a válaszaid, a 30 napos terved és ez a rendelés már ott vannak. Semmit nem kell újra begépelned.`;
}

syncBuyButton();
show(0, false);
