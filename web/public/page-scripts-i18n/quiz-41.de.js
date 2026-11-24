
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

const GOAL_LABEL = { radiance: "Haut, die heller aussieht", fine_lines: "feine Linien", hydration: "tiefe Feuchtigkeit", even_tone: "ein gleichmäßiger Teint" };
const SKIN_LABEL = { dry: "Trocken", oily: "Fettig", combination: "Mischhaut", sensitive: "Empfindlich", not_sure: "Ich finde es noch heraus" };
const CONCERN_LABEL = { dullness: "Fahlheit", fine_lines: "feine Linien", uneven_tone: "ungleichmäßiger Teint", texture: "raue Textur", dryness: "Trockenheit" };

const NOT_ALONE = {
  radiance: "Gründer und Kreative, die sich jeden Tag präsentieren, beginnen ihren Morgen auf dieselbe Weise. Haut, die fahl und müde aussieht, ist einer der häufigsten Gründe, eine Serumroutine zu beginnen. Das PDRN Brightening Serum ist um PDRN und Peptide aufgebaut, in einer leichten Formel, die der Haut hilft, morgens und abends glatt und hell auszusehen.",
  fine_lines: "Gründer und Kreative, die sich jeden Tag präsentieren, beginnen ihren Morgen auf dieselbe Weise. Feine Linien sind meist das Erste, wofür Menschen ein Serum wollen. Diese Formel verbindet Acetyl Hexapeptide-8 mit PDRN, zwei Inhaltsstoffe, die gewählt wurden, um Haut zu unterstützen, die glatter und heller aussieht, in einem einzigen Schritt, zweimal am Tag. Keine Routine mit zehn Schritten nötig.",
  hydration: "Gründer und Kreative, die sich jeden Tag präsentieren, beginnen ihren Morgen auf dieselbe Weise. Haut, die sich bis mittags gespannt und trocken anfühlt, ist genau das, wofür dieses Serum gemacht ist. Eine Mischung aus Glycerin, Sodium PCA und Natriumhyaluronat spendet tiefe Feuchtigkeit, während Panthenol die Haut pflegt, sodass sie sich angenehm und mit Feuchtigkeit versorgt anfühlt, nicht fettig.",
  even_tone: "Gründer und Kreative, die sich jeden Tag präsentieren, beginnen ihren Morgen auf dieselbe Weise. Ein Teint, der ungleichmäßig aussieht, ist ein häufiges Ärgernis. PDRN und Peptide helfen der Haut, heller und gleichmäßiger auszusehen, und die leichte Formel zieht schnell ein, in einem einfachen Schritt zweimal am Tag."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Hilft der Haut, heller, gleichmäßiger und glatt auszusehen.", match: ["radiance", "Fahlheit", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Ein Peptid, das zusammen mit PDRN Haut unterstützt, die glatter und gleichmäßiger aussieht.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronsäure, Glycerin und Sodium PCA", text: "Eine feuchtigkeitsspendende Mischung, die Wasser anzieht, für Haut, die sich angenehm und glatt anfühlt.", match: ["hydration", "Trockenheit"] },
  { key: "panthenol", name: "Panthenol", text: "Pflegt die Haut und lässt sie sich weich und angenehm anfühlen, eine sanfte Basis für Haut, die leicht reagiert.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Woche 1, nur abends, jede zweite Nacht", "Woche 2, jeden Abend", "Wochen 3–4, morgens und abends"] },
  sometimes:{ key: "standard", lines: ["Tage 1–3, nur abends", "Ab Tag 4, morgens und abends"] },
  never:    { key: "full",     lines: ["Ab Tag 1, morgens und abends, zweimal täglich"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Passt direkt nach der Reinigung, ein zusätzlicher Schritt, etwa eine Minute.",
  few_products: "Kommt nach der Reinigung, vor Ihrer Feuchtigkeitscreme.",
  full_routine: "Schichtet sich nach der Reinigung und vor Feuchtigkeitscreme und SPF, nichts aufzugeben."
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
  $("#naTitle").textContent = "Sie sind nicht allein. " + GOAL_LABEL[g] + " ist der Punkt, an dem die meisten Menschen starten.";
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
    `30 Tage Plan für ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} Haut, Hauptanliegen ${CONCERN_LABEL[a.concern]}. ` +
    `Aufbau: ${ramp.key} (${ramp.lines.join("; ")}). Auftragen um ${fmtTime(a.amTime)} und ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} Haut · Fokus auf ${CONCERN_LABEL[a.concern]} · Ziel: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Aufbau</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Ihre Zeiten</span><span class="v">${fmtTime(a.amTime)} und ${fmtTime(a.pmTime)}, Erinnerungen nur dann</span></div>
    <div class="planrow"><span class="k">Passung zur Routine</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Die Flasche</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), bemessen für zweimal tägliche Anwendung</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Mein Abonnement starten" : "Einmal kaufen") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Das Abonnement verlängert sich alle 30 Tage für $39. Jederzeit pausieren oder kündigen."
    : "Einmalkauf für $49. Kein Abonnement.";
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
  if (!s.firstName) missing.push("Vorname");
  if (!s.lastName) missing.push("Nachname");
  if (!s.address1) missing.push("Straße und Hausnummer");
  if (!s.city) missing.push("Stadt");
  if (!s.stateCode) missing.push("Bundesstaat");
  if (!s.zip) missing.push("ZIP Code");
  if (!p.email) missing.push("E-Mail");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Fast geschafft, ergänzen Sie Ihre " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Ihre Bestellung wird aufgegeben…";

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
      btn.textContent = "Sie werden zum sicheren Kaufabschluss gebracht…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Beim Aufgeben Ihrer Bestellung ist etwas schiefgelaufen, Ihre Angaben sind noch hier, bitte versuchen Sie es erneut. Wenn es weiter fehlschlägt, schreiben Sie an talia@tavalabs.app und wir kümmern uns darum.";
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
    <h3>Bestellübersicht</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Versand an</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Ihr Plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Erinnerungen um ${fmtTime(p.answers.amTime)} und ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan gesendet an</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Melden Sie sich in der App mit ${p.email} an, derselben E-Mail, die Sie hier verwendet haben, und Ihre Antworten, Ihr 30 Tage Plan und diese Bestellung sind bereits da. Nichts erneut einzugeben.`;
}

syncBuyButton();
show(0, false);
