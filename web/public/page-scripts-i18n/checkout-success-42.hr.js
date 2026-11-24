
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
  const done = () => { btn.textContent = "Kopirano ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopirajte ovo:", text); });
  } else {
    window.prompt("Kopirajte ovo:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Nismo mogli pronaći vašu referencu naplate na ovoj stranici, vaš kod za preuzimanje također je u vašoj e pošti s potvrdom. Zadržite tu e poštu i upotrijebite kod kada instalirate aplikaciju.";
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
        (c.alreadyClaimed ? "Već preuzeto u vaš račun u aplikaciji. " : "") +
        (exp ? "Zadržite ga do " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopirajte kod za preuzimanje"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopirajte poveznicu za preuzimanje"));
      claimStatus.textContent = "Ovaj kod povezuje vašu kupnju s vašim računom u aplikaciji:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Ova kupnja već živi u računu u aplikaciji, pa nema koda za preuzimanje, samo se prijavite u aplikaciju.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Potvrđujemo vaše plaćanje, vaš kod za preuzimanje pojavit će se ovdje za nekoliko sekundi…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Vaše plaćanje potvrđeno je e poštom, vaš kod za preuzimanje također je u toj e pošti. Zadržite ga i unesite ga u aplikaciju kada je instalirate.";
    }
  }
}
loadClaim(0);
