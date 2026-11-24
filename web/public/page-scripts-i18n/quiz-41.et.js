
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

const GOAL_LABEL = { radiance: "säravus ja sära", fine_lines: "peened jooned", hydration: "sügav niisutus", even_tone: "ühtlane toon" };
const SKIN_LABEL = { dry: "Kuiv", oily: "Rasune", combination: "Kombineeritud", sensitive: "Tundlik", not_sure: "Alles selgitan välja" };
const CONCERN_LABEL = { dullness: "tuhmus", fine_lines: "peened jooned", uneven_tone: "ebaühtlane toon", texture: "kare tekstuur", dryness: "kuivus" };

const NOT_ALONE = {
  radiance: "Asutajad ja loojad, kes end iga päev esitlevad, alustavad oma hommikut samamoodi. Tuhm, väsinud välimusega nahk on üks levinumaid põhjuseid, miks inimesed seerumirutiini alustavad. PDRN Brightening Serum on ehitatud PDRN-i ja peptiidide ümber kerges valemis, mis on loodud parandama sileda ja särava naha välimust, jättes selle täidlase, pehme ja värskena, hommikul ja õhtul.",
  fine_lines: "Asutajad ja loojad, kes end iga päev esitlevad, alustavad oma hommikut samamoodi. Peened jooned on tavaliselt esimene asi, mille pärast inimesed seerumit soovivad. See valem ühendab acetyl hexapeptide-8 PDRN-iga, koostisosad, mis on valitud toetama nahka, mis näeb siledam ja säravam välja, ühes sammus, kaks korda päevas. Kümne sammu rutiini ei ole vaja.",
  hydration: "Asutajad ja loojad, kes end iga päev esitlevad, alustavad oma hommikut samamoodi. Nahk, mis tundub keskpäevaks kiskuv ja janune, on täpselt see, mille jaoks see seerum on tehtud. Glütseriini, sodium PCA ja sodium hyaluronate segu pakub sügavat niisutust, samal ajal kui panthenol hooldab, nii et nahk tundub mugav ja näeb täidlane välja, mitte rasvane.",
  even_tone: "Asutajad ja loojad, kes end iga päev esitlevad, alustavad oma hommikut samamoodi. Ebaühtlase välimusega jume on levinud frustratsioon. PDRN ja peptiidid aitavad edendada säravamat ja elavama välimusega jumet ning kerge valem imendub kiiresti ja lihtsalt, lihtne kaks korda päevas tehtav samm ühtlasema välimuse poole."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Aitab edendada säravamat ja elavama välimusega jumet ning parandab sileda ja särava naha välimust.", match: ["radiance", "tuhmus", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptiid, mis töötab koos PDRN-iga, et toetada nahka, mis näeb siledam ja ühtlasem välja.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "Niisutusegu, mis tõmbab niiskust ligi täidlase ja mugava tunde ning siidiselt sileda tekstuuri heaks.", match: ["hydration", "kuivus"] },
  { key: "panthenol", name: "Panthenol", text: "Hooldab nahka, jättes selle pehme ja mugava tundena, lahke põhi nahale, mis reageerib kergesti.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["1. nädal, õhtuti, üle õhtu", "2. nädal, igal õhtul", "3. kuni 4. nädal, hommikul ja õhtul"] },
  sometimes:{ key: "standard", lines: ["1. kuni 3. päev, ainult õhtuti", "Alates 4. päevast, hommikul ja õhtul"] },
  never:    { key: "full",     lines: ["Alates 1. päevast, hommikul ja õhtul, kaks korda päevas"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Sobitub kohe pärast puhastamist, üks lisatud samm, umbes minut.",
  few_products: "Läheb peale pärast puhastamist, enne sinu niisutajat.",
  full_routine: "Kihistub pärast puhastamist ning enne niisutajat ja SPF-i, millestki loobuma ei pea."
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
  $("#naTitle").textContent = "Sa ei ole üksi. " + GOAL_LABEL[g] + " on koht, kust enamik inimesi alustab.";
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
    `30 päeva plaan eesmärgile ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} nahk, peamine mure ${CONCERN_LABEL[a.concern]}. ` +
    `Sisseelamine: ${ramp.key} (${ramp.lines.join("; ")}). Kanna peale kell ${fmtTime(a.amTime)} ja ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} nahk · fookus: ${CONCERN_LABEL[a.concern]} · eesmärk: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Sisseelamine</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Sinu ajad</span><span class="v">${fmtTime(a.amTime)} ja ${fmtTime(a.pmTime)}, meeldetuletused ainult siis</span></div>
    <div class="planrow"><span class="k">Rutiini sobivus</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Pudel</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), suurus kaks korda päevas kasutamiseks</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Alusta minu tellimust" : "Osta üks kord") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Tellimus uueneb iga 30 päeva tagant hinnaga $39. Peata või tühista igal ajal."
    : "Ühekordne ost hinnaga $49. Tellimust ei ole.";
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
  if (!s.firstName) missing.push("eesnimi");
  if (!s.lastName) missing.push("perekonnanimi");
  if (!s.address1) missing.push("tänava aadress");
  if (!s.city) missing.push("linn");
  if (!s.stateCode) missing.push("osariik");
  if (!s.zip) missing.push("ZIP-kood");
  if (!p.email) missing.push("e-post");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Peaaegu valmis, lisa oma " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Sinu tellimuse esitamine…";

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
      btn.textContent = "Viin sind turvalisse kassasse…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Midagi läks sinu tellimuse esitamisel valesti, sinu andmed on endiselt siin, proovi uuesti. Kui see ebaõnnestub jätkuvalt, kirjuta talia@tavalabs.app ja me lahendame selle.";
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
    <h3>Tellimuse kokkuvõte</h3>
    <div class="planrow"><span class="k">Toode</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Saadetakse</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Sinu plaan</span><span class="v">${plan.rampLines.join(" · ")}<br>Meeldetuletused kell ${fmtTime(p.answers.amTime)} ja ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plaan saadetud</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Logi rakendusse sisse aadressiga ${p.email}, sama e-post, mida sa siin kasutasid, ja sinu vastused, sinu 30 päeva plaan ja see tellimus on juba seal. Midagi uuesti sisestada ei ole.`;
}

syncBuyButton();
show(0, false);
