
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
  const done = () => { btn.textContent = "Ikkuppjat ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Ikkoppja dan:", text); });
  } else {
    window.prompt("Ikkoppja dan:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Ma stajniex insibu r referenza tal ħlas tiegħek f din il paġna, il kodiċi tat talba tiegħek jinsab ukoll fl email ta konferma tiegħek. Żomm dik l email u uża l kodiċi meta tinstalla l app.";
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
        (c.alreadyClaimed ? "Diġà ġie mitlub fil kont tal app tiegħek. " : "") +
        (exp ? "Żommu sa " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Ikkoppja l kodiċi tat talba"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Ikkoppja l link tat talba"));
      claimStatus.textContent = "Dan il kodiċi jgħaqqad ix xiri tiegħek mal kont tal app tiegħek:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Dan ix xiri diġà jgħix f kont tal app, għalhekk m hemm l ebda kodiċi x titlob, idħol biss fl app.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Qed nikkonfermaw il ħlas tiegħek, il kodiċi tat talba tiegħek se jidher hawn fi ftit sekondi…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Il ħlas tiegħek huwa kkonfermat bl email, il kodiċi tat talba tiegħek jinsab f dik l email ukoll. Żommu, u daħħlu fl app meta tinstallaha.";
    }
  }
}
loadClaim(0);
