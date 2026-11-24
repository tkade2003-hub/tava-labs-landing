
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
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopirajte to:", text); });
  } else {
    window.prompt("Kopirajte to:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Na tej strani nismo našli vaše reference z blagajne, vaša koda za prevzem je tudi v vašem potrditvenem e-poštnem sporočilu. Shranite to sporočilo in uporabite kodo, ko namestite aplikacijo.";
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
        (c.alreadyClaimed ? "Že prevzeto v vaš račun v aplikaciji. " : "") +
        (exp ? "Shranite jo do " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopirajte kodo za prevzem"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopirajte povezavo za prevzem"));
      claimStatus.textContent = "Ta koda poveže vaš nakup z vašim računom v aplikaciji:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Ta nakup že živi v računu v aplikaciji, zato ni kode za prevzem, samo prijavite se v aplikacijo.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Potrjevanje vašega plačila, vaša koda za prevzem se bo tukaj prikazala čez nekaj sekund …";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Vaše plačilo je potrjeno po e-pošti, vaša koda za prevzem je tudi v tem sporočilu. Shranite ga in jo vnesite v aplikacijo, ko jo namestite.";
    }
  }
}
loadClaim(0);
