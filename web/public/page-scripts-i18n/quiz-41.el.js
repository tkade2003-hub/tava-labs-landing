
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

const GOAL_LABEL = { radiance: "πιο φωτεινό στην όψη δέρμα", fine_lines: "λεπτές γραμμές", hydration: "βαθιά ενυδάτωση", even_tone: "ένας ομοιόμορφος τόνος" };
const SKIN_LABEL = { dry: "Ξηρό", oily: "Λιπαρό", combination: "Μεικτό", sensitive: "Ευαίσθητο", not_sure: "Ακόμη το ανακαλύπτω" };
const CONCERN_LABEL = { dullness: "θαμπάδα", fine_lines: "λεπτές γραμμές", uneven_tone: "ανομοιόμορφος τόνος", texture: "τραχιά υφή", dryness: "ξηρότητα" };

const NOT_ALONE = {
  radiance: "Ιδρυτές και δημιουργοί που παρουσιάζουν τον εαυτό τους κάθε μέρα ξεκινούν το πρωί τους με τον ίδιο τρόπο. Το θαμπό, κουρασμένο στην όψη δέρμα είναι ένας από τους πιο συνηθισμένους λόγους που οι άνθρωποι ξεκινούν μια ρουτίνα ορού. Το PDRN Brightening Serum είναι χτισμένο γύρω από PDRN και πεπτίδια, σε μια ελαφριά φόρμουλα που βοηθά το δέρμα να φαίνεται λείο και φωτεινό, πρωί και βράδυ.",
  fine_lines: "Ιδρυτές και δημιουργοί που παρουσιάζουν τον εαυτό τους κάθε μέρα ξεκινούν το πρωί τους με τον ίδιο τρόπο. Οι λεπτές γραμμές είναι συνήθως το πρώτο πράγμα για το οποίο οι άνθρωποι θέλουν έναν ορό. Αυτή η φόρμουλα συνδυάζει acetyl hexapeptide-8 με PDRN, δύο συστατικά που επιλέχθηκαν για να υποστηρίξουν δέρμα που φαίνεται πιο λείο και πιο φωτεινό, σε ένα βήμα, δύο φορές την ημέρα. Δεν απαιτείται ρουτίνα δέκα βημάτων.",
  hydration: "Ιδρυτές και δημιουργοί που παρουσιάζουν τον εαυτό τους κάθε μέρα ξεκινούν το πρωί τους με τον ίδιο τρόπο. Το δέρμα που αισθάνεται σφιχτό και ξηρό έως το μεσημέρι είναι ακριβώς αυτό για το οποίο είναι φτιαγμένος αυτός ο ορός. Ένα μείγμα γλυκερίνης, Sodium PCA και Sodium Hyaluronate παρέχει βαθιά ενυδάτωση, ενώ η πανθενόλη περιποιείται το δέρμα, έτσι αισθάνεται άνετο και ενυδατωμένο, όχι λιπαρό.",
  even_tone: "Ιδρυτές και δημιουργοί που παρουσιάζουν τον εαυτό τους κάθε μέρα ξεκινούν το πρωί τους με τον ίδιο τρόπο. Μια ανομοιόμορφη στην όψη επιδερμίδα είναι μια συνηθισμένη απογοήτευση. Το PDRN και τα πεπτίδια βοηθούν το δέρμα να φαίνεται πιο φωτεινό και πιο ομοιόμορφο και η ελαφριά φόρμουλα απορροφάται γρήγορα, σε ένα απλό βήμα που χρησιμοποιείται δύο φορές την ημέρα."
};

/* Ingredient groups from the verified Supliful listing. Cosmetic language only. */
const INGREDIENTS = [
  { key: "pdrn", name: "PDRN (polydeoxyribonucleotide)", text: "Βοηθά το δέρμα να φαίνεται πιο φωτεινό, πιο ομοιόμορφο και λείο.", match: ["radiance", "θαμπάδα", "uneven_tone", "even_tone"] },
  { key: "peptide", name: "Acetyl hexapeptide-8", text: "Ένα πεπτίδιο που συνεργάζεται με το PDRN για να υποστηρίξει δέρμα που δείχνει πιο λείο και πιο ομοιόμορφο.", match: ["fine_lines", "texture"] },
  { key: "ha", name: "Υαλουρονικό οξύ, γλυκερίνη και Sodium PCA", text: "Ένα μείγμα ενυδάτωσης που τραβά υγρασία, για δέρμα που αισθάνεται άνετο και λείο.", match: ["hydration", "ξηρότητα"] },
  { key: "panthenol", name: "Panthenol", text: "Περιποιείται το δέρμα, αφήνοντάς το να αισθάνεται απαλό και άνετο, μια ευγενική βάση για δέρμα που αντιδρά εύκολα.", match: ["sensitive"] }
];

const RAMPS = {
  often:    { key: "gentle",   lines: ["Εβδομάδα 1: μόνο τα βράδια, κάθε δεύτερο βράδυ", "Εβδομάδα 2: κάθε βράδυ", "Εβδομάδες 3 έως 4: πρωί και βράδυ"] },
  sometimes:{ key: "standard", lines: ["Ημέρες 1 έως 3: μόνο τα βράδια", "Από την ημέρα 4 και μετά: πρωί και βράδυ"] },
  never:    { key: "full",     lines: ["Από την ημέρα 1: πρωί και βράδυ, δύο φορές την ημέρα"] }
};

const ROUTINE_FIT = {
  cleanser_only: "Μπαίνει αμέσως μετά τον καθαρισμό, ένα πρόσθετο βήμα, περίπου ένα λεπτό.",
  few_products: "Εφαρμόζεται μετά τον καθαρισμό, πριν από την ενυδατική σας κρέμα.",
  full_routine: "Στρώνεται μετά τον καθαρισμό και πριν από την ενυδατική κρέμα και το SPF, τίποτα να μην εγκαταλείψετε."
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
  const suffix = h >= 12 ? "ΜΜ" : "ΠΜ";
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
  $("#naTitle").textContent = "Δεν είστε μόνοι. " + GOAL_LABEL[g] + " είναι το σημείο από όπου ξεκινούν οι περισσότεροι.";
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
    `Πλάνο 30 ημερών για ${GOAL_LABEL[a.goal]}: δέρμα ${SKIN_LABEL[a.skinType]}, κύρια ανησυχία ${CONCERN_LABEL[a.concern]}. ` +
    `Σταδιακή αύξηση: ${ramp.key} (${ramp.lines.join("; ")}). Εφαρμόστε στις ${fmtTime(a.amTime)} και ${fmtTime(a.pmTime)}. ` +
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
    <p class="mirrorline">Δέρμα ${SKIN_LABEL[a.skinType]} · έμφαση στο ${CONCERN_LABEL[a.concern]} · στόχος: ${GOAL_LABEL[a.goal]}</p>
    <div class="planrow"><span class="k">Σταδιακή αύξηση</span><span class="v">${plan.rampLines.join("<br>")}</span></div>
    <div class="planrow"><span class="k">Οι ώρες σας</span><span class="v">${fmtTime(a.amTime)} και ${fmtTime(a.pmTime)}, υπενθυμίσεις μόνο τότε</span></div>
    <div class="planrow"><span class="k">Προσαρμογή ρουτίνας</span><span class="v">${ROUTINE_FIT[a.routine]}</span></div>
    <div class="planrow"><span class="k">Το μπουκάλι</span><span class="v">PDRN Brightening Serum, 1 fl oz (30 ml), σε μέγεθος για χρήση δύο φορές την ημέρα</span></div>`;
}

/* Checkout */
const DEMO = FUNNEL_INTAKE_URL.trim() === "";
if (DEMO) $("#demoBanner").hidden = false;

function syncBuyButton() {
  const sub = state.purchaseType === "subscribe";
  $("#buyBtn").textContent = (sub ? "Ξεκινήστε τη συνδρομή μου" : "Αγορά μία φορά") + " — $" + PRICES[state.purchaseType];
  $("#payNote").textContent = sub
    ? "Η συνδρομή ανανεώνεται κάθε 30 ημέρες στα $39. Παύση ή ακύρωση ανά πάσα στιγμή."
    : "Αγορά μίας φοράς $49. Χωρίς συνδρομή.";
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
  if (!s.firstName) missing.push("όνομα");
  if (!s.lastName) missing.push("επώνυμο");
  if (!s.address1) missing.push("διεύθυνση οδού");
  if (!s.city) missing.push("πόλη");
  if (!s.stateCode) missing.push("πολιτεία");
  if (!s.zip) missing.push("ταχυδρομικός κώδικας");
  if (!p.email) missing.push("email");
  return missing;
}

$("#shipForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = buildPayload();
  const errBox = $("#shipErr");
  const missing = validateShipping(payload);
  if (missing.length) {
    errBox.textContent = "Σχεδόν εκεί, προσθέστε το " + missing.join(", ") + ".";
    errBox.style.display = "block";
    return;
  }
  errBox.style.display = "none";
  if (window.posthog) posthog.capture("checkout_clicked", { purchase_type: payload.order.purchaseType, price: payload.order.price });
  const btn = $("#buyBtn");
  btn.disabled = true;
  btn.textContent = "Υποβολή της παραγγελίας σας…";

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
      btn.textContent = "Μετάβαση στην ασφαλή ολοκλήρωση αγοράς…";
      window.location.href = data.checkoutUrl;
      return;
    }
    renderThanks(payload, false);
    next();
  } catch (err) {
    console.error("[Tava funnel] intake failed:", err);
    errBox.textContent = "Κάτι πήγε στραβά κατά την υποβολή της παραγγελίας σας. Τα στοιχεία σας βρίσκονται ακόμη εδώ, δοκιμάστε ξανά. Εάν συνεχίζει να αποτυγχάνει, στείλτε email στο support@tavalabs.app και θα το τακτοποιήσουμε.";
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
    <h3>Σύνοψη παραγγελίας</h3>
    <div class="planrow"><span class="k">Προϊόν</span><span class="v">PDRN Brightening Serum · 1 fl oz (30 ml) · ×1</span></div>
    <div class="planrow"><span class="k">${p.order.purchaseType === "subscribe" ? "Subscription" : "One-time"}</span><span class="v">$${p.order.price}${p.order.purchaseType === "subscribe" ? " every 30 days — pause or cancel anytime" : ""}</span></div>
    <div class="planrow"><span class="k">Αποστολή σε</span><span class="v">${s.firstName} ${s.lastName}, ${s.city}, ${s.stateCode} ${s.zip}</span></div>
    <div class="planrow"><span class="k">Το πλάνο σας</span><span class="v">${plan.rampLines.join(" · ")}<br>Υπενθυμίσεις στις ${fmtTime(p.answers.amTime)} και ${fmtTime(p.answers.pmTime)}</span></div>
    <div class="planrow"><span class="k">Το πλάνο στάλθηκε στο</span><span class="v">${p.email}</span></div>`;
  $("#carryLine").textContent =
    `Συνδεθείτε στην εφαρμογή με το ${p.email}, το ίδιο email που χρησιμοποιήσατε εδώ, και οι απαντήσεις σας, το πλάνο 30 ημερών σας και αυτή η παραγγελία βρίσκονται ήδη εκεί. Τίποτα να μην πληκτρολογήσετε ξανά.`;
}

syncBuyButton();
show(0, false);
