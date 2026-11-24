
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
  const done = () => { btn.textContent = "Skopiowano ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Skopiuj to:", text); });
  } else {
    window.prompt("Skopiuj to:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Nie mogliśmy znaleźć Twojego odniesienia do finalizacji zakupu na tej stronie, Twój kod odbioru jest również w Twoim emailu z potwierdzeniem. Zachowaj ten email i użyj kodu, gdy zainstalujesz aplikację.";
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
        (c.alreadyClaimed ? "Już odebrane na Twoje konto w aplikacji. " : "") +
        (exp ? "Zachowaj do " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Kopiuj kod odbioru"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Kopiuj link odbioru"));
      claimStatus.textContent = "Ten kod łączy Twój zakup z Twoim kontem w aplikacji:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Ten zakup już znajduje się na koncie w aplikacji, więc nie ma kodu do odebrania, po prostu zaloguj się do aplikacji.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Potwierdzanie Twojej płatności, Twój kod odbioru pojawi się tutaj za kilka sekund…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Twoja płatność jest potwierdzona emailem, Twój kod odbioru jest również w tym emailu. Zachowaj go i wpisz w aplikacji, gdy ją zainstalujesz.";
    }
  }
}
loadClaim(0);
