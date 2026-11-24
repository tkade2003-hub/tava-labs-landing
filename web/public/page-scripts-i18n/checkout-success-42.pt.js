
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
  const done = () => { btn.textContent = "Copiado ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Copie isto:", text); });
  } else {
    window.prompt("Copie isto:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Não encontrámos a sua referência de pagamento nesta página. O seu código de ativação está também no seu email de confirmação. Guarde esse email e use o código quando instalar a aplicação.";
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
        (c.alreadyClaimed ? "Já ativado na sua conta da aplicação. " : "") +
        (exp ? "Guarde-o até " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Copiar código de ativação"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Copiar link de ativação"));
      claimStatus.textContent = "Este código liga a sua compra à sua conta da aplicação:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Esta compra já está numa conta da aplicação, por isso não há código para ativar. Basta iniciar sessão na aplicação.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "A confirmar o seu pagamento. O seu código de ativação aparecerá aqui dentro de alguns segundos…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "O seu pagamento está confirmado por email. O seu código de ativação está também nesse email. Guarde-o e introduza-o na aplicação quando a instalar.";
    }
  }
}
loadClaim(0);
