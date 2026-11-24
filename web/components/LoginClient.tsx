"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SiteShell from "@/components/SiteShell";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fmt, localizeHref, type Locale } from "@/lib/i18n/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sign-in for the web platform: Supabase Auth email magic link.
// Identity links to the mobile app BY EMAIL — the same email used at
// checkout / in the app carries the same plan, orders, and routine
// (served by the web-account edge function). The project's email
// templates send links only, so the page promises a link, not a code.
export default function LoginClient({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.login;
  const lh = (href: string) => localizeHref(href, locale);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [err1, setErr1] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = lh("/account");
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.href = lh("/account");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sendLink() {
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setErr1(t.invalidEmail);
      return;
    }
    setErr1("");
    setSending(true);
    const { error } = await supabase().auth.signInWithOtp({
      email: value,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}${lh("/account")}`,
      },
    });
    setSending(false);
    if (error) {
      setErr1(t.sendFailed);
      return;
    }
    setEmail(value);
    setStep("sent");
  }

  const subClass = "text-[15px] leading-relaxed text-muted-foreground";
  const labelClass = "text-[13px] font-semibold text-forest-deep";
  const inputClass = "mt-1.5 h-12 rounded-xl bg-white px-4 text-base md:text-base";

  return (
    <SiteShell locale={locale}>
      <style>{`
        .li-wrap{position:relative;background:#FAFAF9;overflow:hidden}
        .li-glow{position:absolute;top:-240px;right:-160px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(216,193,154,.55) 0%,rgba(216,193,154,0) 62%);pointer-events:none}
        .li-inner{position:relative;max-width:1060px;margin:0 auto;padding:56px 24px 72px}
        .li-card{display:grid;grid-template-columns:1fr 1.05fr;border-radius:28px;overflow:hidden;background:#fff;border:1px solid #E7E2D9;box-shadow:0 24px 48px rgba(8,37,29,.16)}
        .li-brand{position:relative;background:#08251D;color:#FAFAF9;padding:44px 40px;display:flex;flex-direction:column;overflow:hidden}
        .li-ring{position:absolute;top:-90px;right:-90px;width:280px;height:280px;border-radius:50%;border:1.5px solid rgba(216,193,154,.45);pointer-events:none}
        .li-brand-head{font-family:'Futura extra font','Futura',sans-serif;font-style:italic;font-weight:900;font-size:56px;line-height:1;margin:44px 0 0}
        .li-brand-head span{display:block;color:#D8C19A}
        .li-brand-copy{font-size:16px;line-height:1.6;color:rgba(250,250,249,.82);max-width:340px;margin:18px 0 0}
        .li-bottle{margin-top:auto;padding-top:30px}
        .li-bottle-in{border-radius:20px;overflow:hidden;aspect-ratio:16/8.5;background:#fff}
        .li-bottle-in img{width:100%;height:100%;object-fit:contain;display:block}
        .li-form{padding:44px 40px;display:flex;flex-direction:column}
        .li-form-main{margin-top:auto}
        .li-form-foot{margin-top:auto;padding-top:22px;border-top:1px solid #E7E2D9;font-size:13px;line-height:1.55;color:#6F695C}
        .li-claim{margin-top:26px;background:#fff;border:1px solid #E7E2D9;border-radius:24px;padding:28px 32px;display:flex;gap:28px;align-items:center;justify-content:space-between}
        @media (max-width:900px){
          .li-inner{padding:36px 18px 52px}
          .li-card{grid-template-columns:1fr}
          .li-brand{padding:32px 28px}
          .li-brand-head{font-size:42px;margin-top:30px}
          .li-bottle-in{aspect-ratio:16/8}
          .li-form{padding:32px 28px}
          .li-claim{flex-direction:column;align-items:flex-start;padding:24px}
        }
      `}</style>
      <section className="li-wrap">
        <div className="li-glow" aria-hidden="true" />
        <div className="li-inner">
          <div className="li-card">
            <div className="li-brand">
              <div className="li-ring" aria-hidden="true" />
              <div style={{ color: "#FAFAF9" }}>
                <Logo className="h-8 w-auto" />
              </div>
              <p className="li-brand-head">
                {t.brandHeadLead}<span>{t.brandHeadAccent}</span>
              </p>
              <p className="li-brand-copy">
                {t.brandCopy}
              </p>
              <div className="li-bottle" aria-hidden="true">
                <div className="li-bottle-in">
                  <img
                    src="/assets/products/pdrn-bright-serum/view-1-mockup.jpg"
                    alt=""
                    width={2000}
                    height={2000}
                  />
                </div>
              </div>
            </div>

            <div className="li-form">
              <div className="li-form-main">
              <p className="tava-label">{t.label}</p>
              <h1 className="mt-1.5 font-display text-[2.125rem] leading-tight font-semibold text-forest-deep">
                {t.title}
              </h1>
              <p className={`${subClass} mt-2`}>
                {t.intro}
              </p>

              {step === "email" ? (
                <div className="mt-5">
                  <Label className={labelClass} htmlFor="email">
                    {t.emailLabel}
                  </Label>
                  <Input
                    className={inputClass}
                    type="email"
                    id="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendLink()}
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
                    className="mt-4 w-full"
                    size="lg"
                    type="button"
                    onClick={sendLink}
                    disabled={sending}
                  >
                    {sending ? t.sending : t.sendButton}
                  </Button>
                </div>
              ) : (
                <div className="mt-5">
                  <div
                    className="mb-4 rounded-xl bg-linen px-3.5 py-3 text-sm text-forest-deep"
                    aria-live="polite"
                  >
                    {fmt(t.sentNotice, { email })}
                  </div>
                  <p className={subClass}>
                    {t.sentBody}
                  </p>
                  <p className={`${subClass} mt-3.5`}>
                    <a
                      href="#"
                      className="font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                      onClick={(e) => {
                        e.preventDefault();
                        sendLink();
                      }}
                    >
                      {t.resend}
                    </a>
                    {"  ·  "}
                    <a
                      href="#"
                      className="font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                      onClick={(e) => {
                        e.preventDefault();
                        setStep("email");
                      }}
                    >
                      {t.differentEmail}
                    </a>
                  </p>
                </div>
              )}
              </div>

              <p className="li-form-foot">
                {t.footNote}
              </p>
            </div>
          </div>

          <div className="li-claim">
            <div>
              <p className="tava-label">{t.claimLabel}</p>
              <h2 className="mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep">
                {t.claimTitle}
              </h2>
              <p className={`${subClass} mt-2 max-w-[38rem]`}>
                {t.claimBody1}
              </p>
              <p className={`${subClass} mt-3 max-w-[38rem]`}>
                {t.claimBody2}
              </p>
            </div>
            <Button
              variant="outline"
              className="h-11 shrink-0 rounded-full border-forest px-6 text-[15px] font-semibold text-forest hover:bg-linen hover:text-forest"
              render={<Link href={lh("/faq")} />}
            >
              {t.faqButton}
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
