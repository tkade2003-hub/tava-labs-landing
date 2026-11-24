
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
  const done = () => { btn.textContent = "Másolva ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Másold ezt:", text); });
  } else {
    window.prompt("Másold ezt:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Nem találtuk a fizetési hivatkozásodat ezen az oldalon, az igénylőkódod a visszaigazoló e-mailedben is szerepel. Őrizd meg azt az e-mailt, és használd a kódot, amikor telepíted az alkalmazást.";
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
        (c.alreadyClaimed ? "Már igényelted az alkalmazás fiókodba. " : "") +
        (exp ? "Őrizd meg eddig: " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Igénylőkód másolása"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Igénylőlink másolása"));
      claimStatus.textContent = "Ez a kód kapcsolja össze a vásárlásodat az alkalmazás fiókoddal:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Ez a vásárlás már egy alkalmazás fiókban él, így nincs igényelhető kód, csak jelentkezz be az alkalmazásba.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "A fizetésed visszaigazolása, az igénylőkódod néhány másodpercen belül megjelenik itt…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "A fizetésedet e-mailben visszaigazoltuk, az igénylőkódod abban az e-mailben is szerepel. Őrizd meg, és add meg az alkalmazásban, amikor telepíted.";
    }
  }
}
loadClaim(0);
