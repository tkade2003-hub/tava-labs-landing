"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      if (data.session) window.location.href = "/account";
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.href = "/account";
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
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    setSending(false);
    if (error) {
      setErr1("We could not send that email. Check the address and try again.");
      return;
    }
    setEmail(value);
    setStep("code");
  }

  async function verify() {
    const token = code.trim();
    if (!/^\d{6}$/.test(token)) {
      setErr2("Enter the six digit code from your email.");
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
      setErr2("That code did not match. Check it and try again, or resend a fresh code.");
      return;
    }
    window.location.href = "/account";
  }

  const cardClass =
    "mb-5 rounded-2xl border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)] sm:p-7";
  const eyebrowClass = "text-xs font-semibold tracking-[0.18em] text-gold uppercase";
  const subClass = "text-[15px] leading-relaxed text-muted-foreground";
  const labelClass = "text-[13px] font-semibold text-forest-deep";
  const inputClass = "mt-1.5 h-12 rounded-xl bg-white px-4 text-base md:text-base";

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-[55rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
        <div className={cardClass}>
          <p className={eyebrowClass}>Your Tava account</p>
          <h1 className="mt-1.5 font-display text-[1.875rem] leading-tight font-semibold text-forest-deep">
            Sign in
          </h1>
          <p className={`${subClass} mt-2`}>
            Sign in with the email you used at checkout or in the Tava mobile app. Your plan,
            orders, and routine are tied to that email, so everything here matches the app. No
            password needed. We email you a six digit code and a sign in link, and either one
            signs you in.
          </p>

          {step === "email" ? (
            <div className="mt-4">
              <Label className={labelClass} htmlFor="email">
                Email address
              </Label>
              <Input
                className={inputClass}
                type="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
              {err1 ? (
                <div
                  className="mt-2.5 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {err1}
                </div>
              ) : null}
              <Button
                className="mt-4 h-12 w-full rounded-full text-[15px] font-semibold"
                type="button"
                onClick={sendCode}
                disabled={sending}
              >
                {sending ? "Sending…" : "Email me a sign in code"}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="mb-4 rounded-xl bg-linen px-3.5 py-3 text-sm text-forest-deep">
                Code sent to {email}. It can take a minute to arrive. Check your spam folder if
                you do not see it.
              </div>
              <Label className={labelClass} htmlFor="code">
                Six digit code from your email
              </Label>
              <Input
                className={inputClass}
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
                <div
                  className="mt-2.5 rounded-xl bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
                  role="alert"
                >
                  {err2}
                </div>
              ) : null}
              <Button
                className="mt-4 h-12 w-full rounded-full text-[15px] font-semibold"
                type="button"
                onClick={verify}
                disabled={verifying}
              >
                {verifying ? "Verifying…" : "Verify & sign in"}
              </Button>
              <p className={`${subClass} mt-3.5`}>
                Rather tap than type? The same email contains a sign in link. Tap it on this
                device and you will land in your account.{" "}
                <a
                  href="#"
                  className="font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
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

        <div className={cardClass}>
          <p className={eyebrowClass}>Bought on the web, using the app?</p>
          <h2 className="mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep">
            Use your claim code in the app
          </h2>
          <p className={`${subClass} mt-2`}>
            When you bought through the quiz or this site, your purchase confirmation email (and
            the page right after checkout) showed a claim code. Open the Tava mobile app, sign in,
            and enter that code in the Orders tab. Your purchase, plan, and quiz answers move into
            your app account, with no second purchase.
          </p>
          <p className={`${subClass} mt-3`}>
            On the web it is simpler still. Sign in above with the same email you checked out
            with, and your orders and plan are already here.
          </p>
          <Button
            variant="outline"
            className="mt-4 h-11 rounded-full border-forest px-6 text-[15px] font-semibold text-forest hover:bg-linen hover:text-forest"
            render={<Link href="/faq" />}
          >
            Questions? See the FAQ
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
