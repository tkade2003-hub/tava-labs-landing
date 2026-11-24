
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

const GOAL_LABEL = { radiance: "сияние и блясък", fine_lines: "фини линии", hydration: "дълбока хидратация", even_tone: "равен тон" };
const SKIN_LABEL = { dry: "Суха", oily: "Мазна", combination: "Комбинирана", sensitive: "Чувствителна", not_sure: "Все още го установявам" };
const CONCERN_LABEL = { dullness: "матовост", fine_lines: "фини линии", uneven_tone: "неравен тон", texture: "груба текстура", dryness: "сухота" };

const NOT_ALONE = {
  radiance: "Основателите и творците, които се представят всеки ден, започват сутринта си по същия начин. Матовата и уморена на вид кожа е една от най честите причини хората да започнат рутина със серум. PDRN Brightening Serum е изграден около PDRN и пептиди, в лека формула, създадена да подобри вида на гладката и сияйна кожа, като я оставя да изглежда плътна, мека и освежена, сутрин и вечер.",
  fine_lines: "Основателите и творците, които се представят всеки ден, започват сутринта си по същия начин. Фините линии обикновено са първото нещо, за което хората искат серум. Тази формула съчетава acetyl hexapeptide-8 с PDRN, съставки, избрани да подпомогнат кожа, която изглежда по гладка и по сияйна, в една стъпка, два пъти дневно. Не е нужна рутина от десет стъпки.",
  hydration: "Основателите и творците, които се представят всеки ден, започват сутринта си по същия начин. Кожата, която се чувства опъната и жадна до обяд, е точно това, за което е създаден този серум. Смес от глицерин, sodium PCA и sodium hyaluronate осигурява дълбока хидратация, докато panthenol подхранва, така че кожата се чувства комфортна и изглежда плътна, а не мазна.",
  even_tone: "Основателите и творците, които се представят всеки ден, започват сутринта си по същия начин. Неравният на вид тен е често разочарование. PDRN и пептидите помагат да се насърчи по сияен и жив на вид тен, а леката формула попива бързо и лесно, проста стъпка два пъти дневно към по равен вид."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Помага да се насърчи по сияен и жив на вид тен и подобрява вида на гладката и сияйна кожа.", match: ["radiance", "матовост", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Пептид, който работи заедно с PDRN, за да подпомогне кожа, която изглежда по гладка и по равна.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "Хидратираща смес, която привлича влага за плътно и комфортно усещане и копринено гладка текстура.", match: ["hydration", "сухота"] },
  { key: "panthenol", name: "Panthenol", text: "Подхранва кожата, като я оставя да се чувства мека и комфортна, нежна основа за кожа, която реагира лесно.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Седмица 1, само вечери, през вечер", "Седмица 2, всяка вечер", "Седмици 3 до 4, сутрин и вечер"] },
  sometimes:{ key: "standard", lines: ["Дни 1 до 3, само вечери", "От ден 4 нататък, сутрин и вечер"] },
  never:    { key: "full",     lines: ["От ден 1, сутрин и вечер, два пъти дневно"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Влиза веднага след почистването, една добавена стъпка, около минута.",
  few_products: "Нанася се след почистване, преди овлажнителя ви.",
  full_routine: "Наслоява се след почистване и преди овлажнител и SPF, нищо за отказване."
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
  $("#naTitle").textContent = "Не сте сами. " + GOAL_LABEL[g] + " е мястото, откъдето повечето хора започват.";
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
    `30 дневен план за ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} кожа, основно притеснение ${CONCERN_LABEL[a.concern]}. ` +
    `Постепенно въвеждане: ${ramp.key} (${ramp.lines.join("; ")}). Нанасяйте в ${fmtTime(a.amTime)} и ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} кожа · фокус върху ${CONCERN_LABEL[a.concern]} · цел: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Постепенно въвеждане</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Вашите часове</span><span class="v">${fmtTime(a.amTime)} и ${fmtTime(a.pmTime)}, напомняния само тогава</span></div>
    <div class="planrow"><span class="k">Пасване на рутината</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Бутилката</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), с размер за употреба два пъти дневно</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Започнете абонамента ми" : "Купете веднъж") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Абонаментът се подновява на всеки 30 дни за $39. Поставете на пауза или отменете по всяко време."
    : "Еднократна покупка за $49. Без абонамент.";
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
  if (!s.firstName) missing.push("име");
  if (!s.lastName) missing.push("фамилия");
  if (!s.address1) missing.push("адрес");
  if (!s.city) missing.push("град");
  if (!s.stateCode) missing.push("щат");
  if (!s.zip) missing.push("ZIP код");
  if (!p.email) missing.push("имейл");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Почти сте готови, добавете вашите " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Поставяне на поръчката ви…";

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
      btn.textContent = "Отвеждане към сигурно плащане…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Нещо се обърка при поставянето на поръчката ви, данните ви все още са тук, моля, опитайте отново. Ако продължава да се проваля, пишете на talia@tavalabs.app и ще го оправим.";
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
    <h3>Обобщение на поръчката</h3>
    <div class="planrow"><span class="k">Продукт</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Доставка до</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Вашият план</span><span class="v">${plan.rampLines.join(" · ")}<br>Напомняния в ${fmtTime(p.answers.amTime)} и ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Планът е изпратен до</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Влезте в приложението с ${p.email}, същия имейл, който използвахте тук, и отговорите ви, 30 дневният ви план и тази поръчка вече са там. Нищо за повторно въвеждане.`;
}

syncBuyButton();
show(0, false);
