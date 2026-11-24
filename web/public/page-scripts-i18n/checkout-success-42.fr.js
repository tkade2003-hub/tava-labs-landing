
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
  const done = () => { btn.textContent = "Copié ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Copiez ceci :", text); });
  } else {
    window.prompt("Copiez ceci :", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Nous n'avons pas trouvé votre référence de paiement sur cette page. Votre code de réclamation se trouve aussi dans votre e mail de confirmation. Conservez cet e mail et utilisez le code quand vous installerez l'application.";
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
        (c.alreadyClaimed ? "Déjà réclamé dans votre compte de l'application. " : "") +
        (exp ? "Conservez le jusqu'au " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Copier le code de réclamation"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Copier le lien de réclamation"));
      claimStatus.textContent = "Ce code relie votre achat à votre compte dans l'application :";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Cet achat vit déjà dans un compte de l'application, il n'y a donc aucun code à réclamer. Connectez vous simplement à l'application.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Confirmation de votre paiement en cours. Votre code de réclamation apparaîtra ici dans quelques secondes…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Votre paiement est confirmé par e mail. Votre code de réclamation se trouve aussi dans cet e mail. Conservez le et saisissez le dans l'application quand vous l'installerez.";
    }
  }
}
loadClaim(0);
