
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
  const done = () => { btn.textContent = "Kopiert ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Kopieren Sie dies:", text); });
  } else {
    window.prompt("Kopieren Sie dies:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Wir konnten Ihre Kauf Referenz auf dieser Seite nicht finden, Ihr Einlösecode ist auch in Ihrer Bestätigungs E-Mail. Behalten Sie diese E-Mail und verwenden Sie den Code, wenn Sie die App installieren.";
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
        (c.alreadyClaimed ? "Bereits in Ihr App Konto eingelöst. " : "") +
        (exp ? "Behalten Sie ihn bis " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Einlösecode kopieren"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Einlöselink kopieren"));
      claimStatus.textContent = "Dieser Code verbindet Ihren Kauf mit Ihrem App Konto:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Dieser Kauf lebt bereits in einem App Konto, daher gibt es keinen Code einzulösen, melden Sie sich einfach in der App an.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Ihre Zahlung wird bestätigt, Ihr Einlösecode erscheint hier in wenigen Sekunden…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Ihre Zahlung ist per E-Mail bestätigt, Ihr Einlösecode ist auch in dieser E-Mail. Behalten Sie sie und geben Sie ihn in der App ein, wenn Sie sie installieren.";
    }
  }
}
loadClaim(0);
