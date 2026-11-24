
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

const GOAL_LABEL = { radiance: "pele com um aspeto mais luminoso", fine_lines: "linhas finas", hydration: "hidratação profunda", even_tone: "um tom uniforme" };
const SKIN_LABEL = { dry: "Seca", oily: "Oleosa", combination: "Mista", sensitive: "Sensível", not_sure: "Ainda estou a descobrir" };
const CONCERN_LABEL = { dullness: "aspeto baço", fine_lines: "linhas finas", uneven_tone: "tom irregular", texture: "textura áspera", dryness: "secura" };

const NOT_ALONE = {
  radiance: "Fundadores e criadores que se apresentam todos os dias começam a manhã da mesma forma. Uma pele baça e com um aspeto cansado é uma das razões mais comuns para as pessoas começarem uma rotina com um sérum. O PDRN Brightening Serum é construído em torno do PDRN e de péptidos, numa fórmula leve que ajuda a pele a parecer suave e luminosa, de manhã e à noite.",
  fine_lines: "Fundadores e criadores que se apresentam todos os dias começam a manhã da mesma forma. As linhas finas são normalmente a primeira coisa para a qual as pessoas procuram um sérum. Esta fórmula combina acetyl hexapeptide-8 com PDRN, dois ingredientes escolhidos para apoiar uma pele que parece mais suave e luminosa, num único passo, duas vezes por dia. Não é necessária nenhuma rotina de dez passos.",
  hydration: "Fundadores e criadores que se apresentam todos os dias começam a manhã da mesma forma. Uma pele que se sente repuxada e seca a meio do dia é exatamente aquilo para que este sérum foi feito. Uma mistura de glicerina, PCA de sódio e hialuronato de sódio proporciona uma hidratação profunda, enquanto o pantenol condiciona a pele, para que se sinta confortável e hidratada, não oleosa.",
  even_tone: "Fundadores e criadores que se apresentam todos os dias começam a manhã da mesma forma. Uma tez com um aspeto irregular é uma frustração comum. O PDRN e os péptidos ajudam a pele a parecer mais luminosa e mais uniforme, e a fórmula leve absorve rapidamente, num passo simples usado duas vezes por dia."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Ajuda a pele a parecer mais luminosa, mais uniforme e suave.", match: ["radiance", "aspeto baço", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Um péptido que trabalha ao lado do PDRN para apoiar uma pele com aspeto mais suave e uniforme.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Ácido hialurónico, glicerina e PCA de sódio", text: "Uma mistura de hidratação que atrai a humidade, para uma pele que se sente confortável e suave.", match: ["hydration", "secura"] },
  { key: "panthenol", name: "Panthenol", text: "Condiciona a pele, deixando-a suave e confortável, uma base suave para a pele que reage facilmente.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Semana 1: só à noite, em noites alternadas", "Semana 2: todas as noites", "Semanas 3–4: de manhã e à noite"] },
  sometimes:{ key: "standard", lines: ["Dias 1–3: só à noite", "Do dia 4 em diante: de manhã e à noite"] },
  never:    { key: "full",     lines: ["Desde o dia 1: de manhã e à noite, duas vezes por dia"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Encaixa logo após a limpeza, um passo acrescentado, cerca de um minuto.",
  few_products: "Aplica-se após a limpeza, antes do seu hidratante.",
  full_routine: "Aplica-se em camadas após a limpeza e antes do hidratante e do FPS, sem abdicar de nada."
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
  $("#naTitle").textContent = "Não está sozinho. " + GOAL_LABEL[g] + " é onde a maioria das pessoas começa.";
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
    `Plano de 30 dias para ${GOAL_LABEL[a.goal]}: pele ${SKIN_LABEL[a.skinType]}, preocupação principal ${CONCERN_LABEL[a.concern]}. ` +
    `Progressão: ${ramp.key} (${ramp.lines.join("; ")}). Aplicar às ${fmtTime(a.amTime)} e às ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">Pele ${SKIN_LABEL[a.skinType]} · foco em ${CONCERN_LABEL[a.concern]} · objetivo: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Progressão</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Os seus horários</span><span class="v">${fmtTime(a.amTime)} e ${fmtTime(a.pmTime)}: lembretes apenas a essas horas</span></div>
    <div class="planrow"><span class="k">Ajuste à rotina</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">O frasco</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), dimensionado para uso duas vezes por dia</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Iniciar a minha subscrição" : "Comprar uma vez") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "A subscrição renova a cada 30 dias por $39. Pause ou cancele a qualquer momento."
    : "Compra única de $49. Sem subscrição.";
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
  if (!s.firstName) missing.push("nome próprio");
  if (!s.lastName) missing.push("apelido");
  if (!s.address1) missing.push("endereço");
  if (!s.city) missing.push("cidade");
  if (!s.stateCode) missing.push("estado");
  if (!s.zip) missing.push("código postal");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Quase lá, adicione o seu " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "A efetuar a sua encomenda…";

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
      btn.textContent = "A levá-lo para o pagamento seguro…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Algo correu mal ao efetuar a sua encomenda. Os seus dados continuam aqui, tente novamente. Se continuar a falhar, envie email para talia@tavalabs.app e nós resolvemos.";
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
    <h3>Resumo da encomenda</h3>
    <div class="planrow"><span class="k">Produto</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Enviar para</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">O seu plano</span><span class="v">${plan.rampLines.join(" · ")}<br>Lembretes às ${fmtTime(p.answers.amTime)} e às ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Plano enviado para</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Inicie sessão na aplicação com ${p.email}, o mesmo email que usou aqui, e as suas respostas, o seu plano de 30 dias e esta encomenda já lá estão. Não há nada para voltar a escrever.`;
}

syncBuyButton();
show(0, false);
