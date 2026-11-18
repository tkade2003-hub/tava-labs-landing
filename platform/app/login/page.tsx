"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlatformHeader, PlatformFooter } from "@/components/Chrome";

// Sign-in for the web platform: Supabase Auth email OTP (6-digit code)
// or magic link. Identity links to the mobile app BY EMAIL — the same
// email used at checkout / in the app carries the same plan, orders,
// and routine (served by the web-account edge function).
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "app.html";
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.href = "app.html";
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendCode() {
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setErr1("Enter a valid email address.");
      return;
    }
    setErr1("");
    setSending(true);
    const { error } = await supabase().auth.signInWithOtp({
      email: value,
      options: { shouldCreateUser: true, emailRedirectTo: "https://tavalabs.app/app.html" },
    });
    setSending(false);
    if (error) {
      setErr1("We couldn't send that email — check the address and try again.");
      return;
    }
    setEmail(value);
    setStep("code");
  }

  async function verify() {
    const token = code.trim();
    if (!/^\d{6}$/.test(token)) {
      setErr2("Enter the 6-digit code from your email.");
      return;
    }
    setErr2("");
    setVerifying(true);
    const { data, error } = await supabase().auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "email",
    });
    setVerifying(false);
    if (error || !data.session) {
      setErr2("That code didn't match — check it and try again, or resend a fresh code.");
      return;
    }
    window.location.href = "app.html";
  }

  return (
    <>
      <PlatformHeader />
      <main className="p-wrap">
        <div className="p-card">
          <p className="p-eyebrow">Your Tava account</p>
          <h1 className="p-title">Sign in</h1>
          <p className="p-sub">
            Use the same email you bought with or use in the Tava mobile app — your plan, orders,
            and routine are tied to that email, so everything shows up here exactly as it does in
            the app. No password: we email you a 6-digit code and a sign-in link, and either one
            signs you in.
          </p>

          {step === "email" ? (
            <div>
              <label className="p-label" htmlFor="email">
                Email address
              </label>
              <input
                className="p-input"
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
              {err1 ? (
                <div className="p-error" style={{ display: "block" }} role="alert">
                  {err1}
                </div>
              ) : null}
              <button className="p-btn" type="button" onClick={sendCode} disabled={sending}>
                {sending ? "Sending…" : "Email me a sign-in code"}
              </button>
            </div>
          ) : (
            <div>
              <div className="p-note" style={{ display: "block" }}>
                Code sent to {email}. It can take a minute to arrive — check spam if you don&apos;t
                see it.
              </div>
              <label className="p-label" htmlFor="code">
                6-digit code from your email
              </label>
              <input
                className="p-input"
                type="text"
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
              />
              {err2 ? (
                <div className="p-error" style={{ display: "block" }} role="alert">
                  {err2}
                </div>
              ) : null}
              <button className="p-btn" type="button" onClick={verify} disabled={verifying}>
                {verifying ? "Verifying…" : "Verify & sign in"}
              </button>
              <p className="p-sub" style={{ marginTop: 14 }}>
                Rather tap than type? The same email also contains a sign-in link — tap it on this
                device and you&apos;ll land in your account.{" "}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setStep("email");
                    sendCode();
                  }}
                >
                  Resend the email
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="p-card">
          <p className="p-eyebrow">Bought on the web, using the app?</p>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Use your claim code in the app</h2>
          <p className="p-sub">
            When you bought through the quiz or this site, your purchase confirmation email (and
            the page right after checkout) showed a claim code. Open the Tava mobile app, sign in,
            and enter that code in the Orders tab — your purchase, plan, and quiz answers move into
            your app account, no second purchase.
          </p>
          <p className="p-sub">
            On the web it&apos;s even simpler: sign in above with the same email you checked out
            with and your orders and plan are already here.
          </p>
          <a className="p-btn secondary" href="faq.html">
            Questions? See the FAQ
          </a>
        </div>
      </main>
      <PlatformFooter />
    </>
  );
}
