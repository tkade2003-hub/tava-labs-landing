
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
  const done = () => { btn.textContent = "Αντιγράφηκε ✓"; setTimeout(() => { btn.textContent = label; }, 2000); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => { window.prompt("Αντιγράψτε αυτό:", text); });
  } else {
    window.prompt("Αντιγράψτε αυτό:", text);
  }
}

async function loadClaim(attempt) {
  if (!sid) {
    claimStatus.textContent = "Δεν μπορέσαμε να βρούμε την αναφορά ολοκλήρωσης αγοράς σας σε αυτή τη σελίδα. Ο κωδικός διεκδίκησής σας βρίσκεται επίσης στο email επιβεβαίωσής σας. Κρατήστε αυτό το email και χρησιμοποιήστε τον κωδικό όταν εγκαταστήσετε την εφαρμογή.";
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
        (c.alreadyClaimed ? "Έχει ήδη διεκδικηθεί στον λογαριασμό σας στην εφαρμογή. " : "") +
        (exp ? "Κρατήστε το έως " + exp.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "." : "");
      document.getElementById("openAppBtn").href = c.deepLink;
      const codeBtn = document.getElementById("copyCodeBtn");
      const linkBtn = document.getElementById("copyLinkBtn");
      codeBtn.addEventListener("click", () => copyText(c.code, codeBtn, "Αντιγραφή κωδικού διεκδίκησης"));
      linkBtn.addEventListener("click", () => copyText(c.webLink, linkBtn, "Αντιγραφή συνδέσμου διεκδίκησης"));
      claimStatus.textContent = "Αυτός ο κωδικός συνδέει την αγορά σας με τον λογαριασμό σας στην εφαρμογή:";
      document.getElementById("claimReady").hidden = false;
      return;
    }
    if (data && data.paid && !data.claim) {
      claimStatus.textContent = "Αυτή η αγορά βρίσκεται ήδη σε έναν λογαριασμό εφαρμογής, οπότε δεν υπάρχει κωδικός για διεκδίκηση. Απλώς συνδεθείτε στην εφαρμογή.";
      return;
    }
    throw new Error("not paid yet");
  } catch (e) {
    if (attempt < 6) {
      claimStatus.textContent = "Επιβεβαίωση της πληρωμής σας. Ο κωδικός διεκδίκησής σας θα εμφανιστεί εδώ σε λίγα δευτερόλεπτα…";
      setTimeout(() => loadClaim(attempt + 1), 4000);
    } else {
      claimStatus.textContent = "Η πληρωμή σας επιβεβαιώνεται μέσω email. Ο κωδικός διεκδίκησής σας βρίσκεται επίσης σε αυτό το email. Κρατήστε το, και εισαγάγετέ τον στην εφαρμογή όταν την εγκαταστήσετε.";
    }
  }
}
loadClaim(0);
