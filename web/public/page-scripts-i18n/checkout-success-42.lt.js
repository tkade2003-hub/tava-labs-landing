
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
  const done = () => { btn.textContent = "Nukopijuota ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopijuokite tai:", text); });
  } else {
    window.prompt("Kopijuokite tai:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Šiame puslapyje neradome jūsų atsiskaitymo nuorodos, jūsų aktyvavimo kodas taip pat yra jūsų patvirtinimo el. laiške. Išsaugokite tą el. laišką ir naudokite kodą, kai įdiegsite programėlę.";
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
        (c.alreadyClaimed ? "Jau aktyvuota į jūsų programėlės paskyrą. " : "") +
        (exp ? "Išsaugokite iki " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopijuoti aktyvavimo kodą"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopijuoti aktyvavimo nuorodą"));
      claimStatus.textContent = "Šis kodas susieja jūsų pirkinį su jūsų programėlės paskyra:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Šis pirkinys jau yra programėlės paskyroje, todėl kodo aktyvuoti nereikia, tiesiog prisijunkite prie programėlės.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Patvirtinamas jūsų mokėjimas, jūsų aktyvavimo kodas čia pasirodys po kelių sekundžių…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Jūsų mokėjimas patvirtintas el. paštu, jūsų aktyvavimo kodas taip pat yra tame el. laiške. Išsaugokite jį ir įveskite programėlėje, kai ją įdiegsite.";
    }
  }
}
loadClaim(0);
