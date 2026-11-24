
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

const GOAL_LABEL = { radiance: "kirkkaammalta näyttävä iho", fine_lines: "hienot juonteet", hydration: "syvä kosteutus", even_tone: "tasainen sävy" };
const SKIN_LABEL = { dry: "Kuiva", oily: "Rasvainen", combination: "Sekaiho", sensitive: "Herkkä", not_sure: "Selvitän sitä vielä" };
const CONCERN_LABEL = { dullness: "sameus", fine_lines: "hienot juonteet", uneven_tone: "epätasainen sävy", texture: "karhea rakenne", dryness: "kuivuus" };

const NOT_ALONE = {
  radiance: "Perustajat ja sisällöntuottajat, jotka esittelevät itsensä joka päivä, aloittavat aamunsa samalla tavalla. Tylsältä ja väsyneeltä näyttävä iho on yksi yleisimmistä syistä, miksi ihmiset aloittavat seerumirutiinin. PDRN Brightening Serum on rakennettu PDRN:n ja peptidien ympärille, kevyeen koostumukseen, joka auttaa ihoa näyttämään sileältä ja kirkkaalta aamuin illoin.",
  fine_lines: "Perustajat ja sisällöntuottajat, jotka esittelevät itsensä joka päivä, aloittavat aamunsa samalla tavalla. Juonteet ovat yleensä ensimmäinen asia, johon ihmiset haluavat seerumin. Tämä koostumus yhdistää asetyyliheksapeptidi-8:n PDRN:ään, kaksi ainesosaa, jotka on valittu tukemaan sileämmältä ja kirkkaammalta näyttävää ihoa, yhdessä vaiheessa kahdesti päivässä. Kymmenen vaiheen rutiinia ei tarvita.",
  hydration: "Perustajat ja sisällöntuottajat, jotka esittelevät itsensä joka päivä, aloittavat aamunsa samalla tavalla. Iho, joka tuntuu kireältä ja kuivalta keskipäivään mennessä, on juuri sitä, mihin tämä seerumi on tehty. Glyseriinin, natrium-PCA:n ja natriumhyaluronaatin sekoitus tarjoaa syvää kosteutusta, kun taas pantenoli hoitaa ihoa, jotta se tuntuu mukavalta ja kosteutetulta, ei rasvaiselta.",
  even_tone: "Perustajat ja sisällöntuottajat, jotka esittelevät itsensä joka päivä, aloittavat aamunsa samalla tavalla. Epätasaiselta näyttävä iho on yleinen turhautumisen aihe. PDRN ja peptidit auttavat ihoa näyttämään kirkkaammalta ja tasaisemmalta, ja kevyt koostumus imeytyy nopeasti, yksinkertaisessa vaiheessa, jota käytetään kahdesti päivässä."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Auttaa ihoa näyttämään kirkkaammalta, tasaisemmalta ja sileältä.", match: ["radiance", "sameus", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Peptidi, joka toimii yhdessä PDRN:n kanssa tukemaan ihoa, joka näyttää sileämmältä ja tasaisemmalta.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Hyaluronic acid, glycerin & sodium PCA", text: "Kosteutussekoitus, joka vetää kosteutta puoleensa, iholle, joka tuntuu mukavalta ja sileältä.", match: ["hydration", "kuivuus"] },
  { key: "panthenol", name: "Panthenol", text: "Hoitaa ihoa ja jättää sen pehmeäksi ja mukavaksi, hellävarainen pohja helposti reagoivalle iholle.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Viikko 1, vain iltaisin, joka toinen ilta", "Viikko 2, joka ilta", "Viikot 3–4, aamuin ja illoin"] },
  sometimes:{ key: "standard", lines: ["Päivät 1–3, vain iltaisin", "Päivästä 4 eteenpäin, aamuin ja illoin"] },
  never:    { key: "full",     lines: ["Päivästä 1 lähtien, aamuin ja illoin, kahdesti päivässä"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Sopii heti puhdistuksen jälkeen, yksi lisätty vaihe, noin minuutti.",
  few_products: "Levitetään puhdistuksen jälkeen, ennen kosteusvoidettasi.",
  full_routine: "Kerrostuu puhdistuksen jälkeen ja ennen kosteusvoidetta ja SPF:ää, mistään ei tarvitse luopua."
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
  $("#naTitle").textContent = "Et ole yksin. " + GOAL_LABEL[g] + " on se, mistä useimmat ihmiset aloittavat.";
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
    `30 päivän suunnitelma tavoitteelle ${GOAL_LABEL[a.goal]}: ${SKIN_LABEL[a.skinType]} iho, päähuolenaihe ${CONCERN_LABEL[a.concern]}. ` +
    `Totuttelu: ${ramp.key} (${ramp.lines.join("; ")}). Levitä klo ${fmtTime(a.amTime)} ja ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">${SKIN_LABEL[a.skinType]} iho · painopiste: ${CONCERN_LABEL[a.concern]} · tavoite: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Totuttelu</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Aikasi</span><span class="v">${fmtTime(a.amTime)} ja ${fmtTime(a.pmTime)}, muistutukset vain silloin</span></div>
    <div class="planrow"><span class="k">Sopivuus rutiiniin</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Pullo</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), mitoitettu kahdesti päivässä käyttöön</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Aloita tilaukseni" : "Osta kerran") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Tilaus uusiutuu 30 päivän välein hintaan $39. Keskeytä tai peruuta milloin tahansa."
    : "Kertaostos hintaan $49. Ei tilausta.";
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
  if (!s.firstName) missing.push("etunimi");
  if (!s.lastName) missing.push("sukunimi");
  if (!s.address1) missing.push("katuosoite");
  if (!s.city) missing.push("kaupunki");
  if (!s.stateCode) missing.push("osavaltio");
  if (!s.zip) missing.push("ZIP koodi");
  if (!p.email) missing.push("sähköposti");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Melkein valmista, lisää " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Tehdään tilaustasi…";

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
      btn.textContent = "Viedään sinut turvalliseen kassaan…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Tilauksesi tekemisessä meni jotain pieleen. Tietosi ovat vielä täällä, yritä uudelleen. Jos se epäonnistuu edelleen, lähetä sähköpostia osoitteeseen support@tavalabs.app, niin hoidamme asian.";
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
    <h3>Tilauksen yhteenveto</h3>
    <div class="planrow"><span class="k">Tuote</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Toimitusosoite</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Suunnitelmasi</span><span class="v">${plan.rampLines.join(" · ")}<br>Muistutukset klo ${fmtTime(p.answers.amTime)} ja ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Suunnitelma lähetetty osoitteeseen</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Kirjaudu sovellukseen osoitteella ${p.email}, samalla sähköpostilla kuin täällä, ja vastauksesi, 30 päivän suunnitelmasi ja tämä tilaus ovat jo siellä. Mitään ei tarvitse kirjoittaa uudelleen.`;
}

syncBuyButton();
show(0, false);
