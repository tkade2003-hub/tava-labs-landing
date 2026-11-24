
"use strict";
/* Stripe appends ?session_id={CHECKOUT_SESSION_ID} to this URL. We show it
   as a support reference; the order itself is confirmed server-side by the
   Stripe webhook, never by this page.
   The claim code is fetched from the claim-lookup edge function using
   that same session id as the capability — it only answers once the
   order is PAID, so we retry for a little while in case the webhook is
   still landing. */
const CLAIM_LOOKUP_URL = "https://vuzrpgkqytzvbbxwsvqr.supabase.co/functions/v1/claim-lookup";
const params = new URLSearchParams(window.location.search);
const sid = params.get("session_id");
if (sid) {
  document.getElementById("refValue").textContent = sid;
  document.getElementById("refLine").hidden = false;
}

const claimStatus = document.getElementById("claimStatus");
function copyText(text, btn, label) {
  const done = () => { btn.textContent = "Kopieret ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopiér dette:", text); });
  } else {
    window.prompt("Kopiér dette:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Vi kunne ikke finde din betalingsreference på denne side, din indløsningskode er også i din bekræftelsesemail. Behold den email og brug koden, når du installerer appen.";
    return;
  }
  try {
    const res = await fetch(CLAIM_LOOKUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid })
    });
    const data = await res.json().catch(() => null);
    if (data && data.paid && data.claim) {
      const c = data.claim;
      document.getElementById("claimCode").textContent = c.code;
      const exp = c.expiresAt ? new Date(c.expiresAt) : null;
      document.getElementById("claimExpiry").textContent =
        (c.alreadyClaimed ? "Allerede indløst på din appkonto. " : "") +
        (exp ? "Behold den indtil " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopiér indløsningskode"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopiér indløsningslink"));
      claimStatus.textContent = "Denne kode forbinder dit køb med din appkonto:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Dette køb bor allerede på en appkonto, så der er ingen kode at indløse, log blot ind i appen.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Bekræfter din betaling, din indløsningskode vises her om få sekunder…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Din betaling er bekræftet via email, din indløsningskode er også i den email. Behold den, og indtast den i appen, når du installerer den.";
    }
  }
}
loadClaim(0);
