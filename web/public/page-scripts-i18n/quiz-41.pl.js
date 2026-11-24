
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

const GOAL_LABEL = { radiance: "blask i promienność", fine_lines: "drobne linie", hydration: "głębokie nawilżenie", even_tone: "równy koloryt" };
const SKIN_LABEL = { dry: "Sucha", oily: "Tłusta", combination: "Mieszana", sensitive: "Wrażliwa", not_sure: "Wciąż to odkrywam" };
const CONCERN_LABEL = { dullness: "matowość", fine_lines: "drobne linie", uneven_tone: "nierówny koloryt", texture: "szorstka tekstura", dryness: "suchość" };

const NOT_ALONE = {
  radiance: "Założyciele i twórcy, którzy prezentują się każdego dnia, zaczynają swój poranek w ten sam sposób. Matowa skóra o zmęczonym wyglądzie to jeden z najczęstszych powodów, dla których ludzie zaczynają rutynę z serum. PDRN Brightening Serum jest zbudowane wokół PDRN i peptydów, w lekkiej formule zaprojektowanej, aby poprawić wygląd gładkiej, promiennej skóry, sprawiając, że wygląda jędrnie, miękko i świeżo, rano i wieczorem.",
  fine_lines: "Założyciele i twórcy, którzy prezentują się każdego dnia, zaczynają swój poranek w ten sam sposób. Drobne linie to zwykle pierwsza rzecz, do której ludzie chcą serum. Ta formuła łączy Acetyl Hexapeptide-8 z PDRN, składniki wybrane, aby wspierać skórę, która wygląda gładsza i bardziej promienna, w jednym kroku, dwa razy dziennie. Nie potrzeba rutyny z dziesięciu kroków.",
  hydration: "Założyciele i twórcy, którzy prezentują się każdego dnia, zaczynają swój poranek w ten sam sposób. Skóra, która w południe czuje się napięta i spragniona, to dokładnie to, do czego stworzono to serum. Mieszanka gliceryny, Sodium PCA i Sodium Hyaluronate zapewnia głębokie nawilżenie, a Panthenol pielęgnuje, więc skóra czuje się komfortowo i wygląda jędrnie, a nie tłusto.",
  even_tone: "Założyciele i twórcy, którzy prezentują się każdego dnia, zaczynają swój poranek w ten sam sposób. Cera o nierównym wyglądzie to częsta frustracja. PDRN i peptydy pomagają wspierać cerę o bardziej promiennym i żywym wyglądzie, a lekka formuła wchłania się szybko i łatwo, prosty krok dwa razy dziennie w kierunku bardziej równego wyglądu."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Pomaga wspierać cerę o bardziej promiennym i żywym wyglądzie oraz poprawia wygląd gładkiej, promiennej skóry.", match: ["radiance", "matowość", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptyd, który współpracuje z PDRN, aby wspierać skórę, która wygląda gładsza i bardziej równa.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "Mieszanka nawilżająca, która przyciąga wilgoć, dla jędrnego, komfortowego uczucia i jedwabiście gładkiej tekstury.", match: ["hydration", "suchość"] },
  { key: "panthenol", name: "Panthenol", text: "Pielęgnuje skórę, sprawiając, że czuje się miękka i komfortowa, łagodna baza dla skóry, która łatwo reaguje.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Tydzień 1, tylko wieczorem, co drugą noc", "Tydzień 2, każdego wieczoru", "Tygodnie 3 do 4, rano i wieczorem"] },
  sometimes:{ key: "standard", lines: ["Dni 1 do 3, tylko wieczorem", "Od dnia 4, rano i wieczorem"] },
  never:    { key: "full",     lines: ["Od dnia 1, rano i wieczorem, dwa razy dziennie"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Wpisuje się zaraz po oczyszczeniu, jeden dodatkowy krok, około minuty.",
  few_products: "Nakłada się po oczyszczeniu, przed kremem nawilżającym.",
  full_routine: "Nakłada się po oczyszczeniu, przed kremem nawilżającym i SPF, z niczego nie trzeba rezygnować."
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
  $("#naTitle").textContent = "Nie jesteś w tym sam. " + GOAL_LABEL[g] + " to miejsce, od którego zaczyna większość osób.";
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
    `30 dniowy plan dla ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} skóra, główny problem ${CONCERN_LABEL[a.concern]}. ` +
    `Wprowadzanie: ${ramp.key} (${ramp.lines.join("; ")}). Nakładaj o ${fmtTime(a.amTime)} i ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} skóra · nacisk na ${CONCERN_LABEL[a.concern]} · cel: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Wprowadzanie</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Twoje godziny</span><span class="v">${fmtTime(a.amTime)} i ${fmtTime(a.pmTime)}, przypomnienia tylko wtedy</span></div>
    <div class="planrow"><span class="k">Dopasowanie do rutyny</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Butelka</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), w rozmiarze na stosowanie dwa razy dziennie</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Rozpocznij moją subskrypcję" : "Kup jednorazowo") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Subskrypcja odnawia się co 30 dni za $39. Wstrzymaj lub anuluj w każdej chwili."
    : "Zakup jednorazowy za $49. Bez subskrypcji.";
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
  if (!s.firstName) missing.push("imię");
  if (!s.lastName) missing.push("nazwisko");
  if (!s.address1) missing.push("adres ulicy");
  if (!s.city) missing.push("miasto");
  if (!s.stateCode) missing.push("stan");
  if (!s.zip) missing.push("kod pocztowy");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Już prawie, dodaj swoje " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Składanie zamówienia…";

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
      btn.textContent = "Przenoszenie do bezpiecznej finalizacji zakupu…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Coś poszło nie tak podczas składania zamówienia, Twoje dane nadal tutaj są, spróbuj ponownie. Jeśli to nadal nie działa, napisz na talia@tavalabs.app, a my to załatwimy.";
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
    <h3>Podsumowanie zamówienia</h3>
    <div class="planrow"><span class="k">Produkt</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Wysyłka do</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Twój plan</span><span class="v">${plan.rampLines.join(" · ")}<br>Przypomnienia o ${fmtTime(p.answers.amTime)} i ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plan wysłany do</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Zaloguj się do aplikacji adresem ${p.email}, tym samym adresem email, którego użyłeś tutaj, a Twoje odpowiedzi, Twój 30 dniowy plan i to zamówienie już tam są. Nie trzeba nic wpisywać ponownie.`;
}

syncBuyButton();
show(0, false);
