
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
  const done = () => { btn.textContent = "Skopírované ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Skopírujte toto:", text); });
  } else {
    window.prompt("Skopírujte toto:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Na tejto stránke sa nám nepodarilo nájsť vašu referenciu pokladne, váš kód na uplatnenie je aj vo vašom potvrdzovacom emaile. Uchovajte si tento email a kód použite, keď si nainštalujete aplikáciu.";
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
        (c.alreadyClaimed ? "Už uplatnené do vášho účtu v aplikácii. " : "") +
        (exp ? "Uchovajte ho do " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopírovať kód na uplatnenie"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopírovať odkaz na uplatnenie"));
      claimStatus.textContent = "Tento kód prepája váš nákup s vaším účtom v aplikácii:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Tento nákup už žije v účte aplikácie, takže nie je žiadny kód na uplatnenie, stačí sa prihlásiť do aplikácie.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Potvrdzuje sa vaša platba, váš kód na uplatnenie sa tu objaví o pár sekúnd…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Vaša platba je potvrdená emailom, váš kód na uplatnenie je aj v tomto emaile. Uchovajte si ho a zadajte ho v aplikácii, keď si ju nainštalujete.";
    }
  }
}
loadClaim(0);
