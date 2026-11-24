
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
  const done = () => { btn.textContent = "Nokopēts ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopējiet šo:", text); });
  } else {
    window.prompt("Kopējiet šo:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Mēs nevarējām atrast jūsu apmaksas atsauci šajā lapā, jūsu pieprasījuma kods ir arī jūsu apstiprinājuma e pastā. Saglabājiet šo e pastu un izmantojiet kodu, kad instalējat lietotni.";
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
        (c.alreadyClaimed ? "Jau pieprasīts jūsu lietotnes kontā. " : "") +
        (exp ? "Saglabājiet to līdz " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopēt pieprasījuma kodu"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopēt pieprasījuma saiti"));
      claimStatus.textContent = "Šis kods savieno jūsu pirkumu ar jūsu lietotnes kontu:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Šis pirkums jau dzīvo lietotnes kontā, tāpēc nav koda, ko pieprasīt, vienkārši pierakstieties lietotnē.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Apstiprina jūsu maksājumu, jūsu pieprasījuma kods parādīsies šeit pēc dažām sekundēm…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Jūsu maksājums ir apstiprināts pa e pastu, jūsu pieprasījuma kods ir arī šajā e pastā. Saglabājiet to un ievadiet lietotnē, kad to instalējat.";
    }
  }
}
loadClaim(0);
