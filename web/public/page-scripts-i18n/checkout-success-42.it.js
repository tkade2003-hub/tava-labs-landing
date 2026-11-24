
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
  const done = () => { btn.textContent = "Copiato ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Copia questo:", text); });
  } else {
    window.prompt("Copia questo:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Non siamo riusciti a trovare il tuo riferimento di pagamento in questa pagina — il tuo codice di riscatto è anche nella tua email di conferma. Conserva quell'email e usa il codice quando installi l'app.";
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
        (c.alreadyClaimed ? "Già riscattato nel tuo account dell'app. " : "") +
        (exp ? "Conservalo fino al " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Copia il codice di riscatto"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Copia il link di riscatto"));
      claimStatus.textContent = "Questo codice collega il tuo acquisto al tuo account dell'app:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Questo acquisto vive già in un account dell'app, quindi non c'è nessun codice da riscattare — accedi semplicemente all'app.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Conferma del pagamento in corso — il tuo codice di riscatto apparirà qui tra pochi secondi…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Il tuo pagamento è confermato via email — il tuo codice di riscatto è anche in quell'email. Conservalo e inseriscilo nell'app quando la installi.";
    }
  }
}
loadClaim(0);
