"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, SUPABASE_ANON_KEY, WEB_ACCOUNT_URL } from "@/lib/supabase";
import type { WebAccountResponse } from "@/lib/types";
import SiteShell from "@/components/SiteShell";
import LabPanels from "@/components/LabPanels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckoutModal,
  type AddOnConfig,
  type BuyType,
  type PriceSet,
} from "@/components/CheckoutModal";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { fmt, localizeHref, type Locale } from "@/lib/i18n/config";

// The signed-in web platform: an exact mirror of the mobile app's tabs —
// Today / Orders / Shop / Lab / Support — fed by the same backend data
// via the web-account edge function (verified email -> profile, plan,
// orders, routine history).

const AM_STEP_IDS = ["am-cleanse", "am-serum", "am-spf"];
const PM_STEP_IDS = ["pm-cleanse", "pm-serum", "pm-moist"];

type StepItem = { id: string; title: string; detail: string };

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function Steps({ steps, doneIds }: { steps: StepItem[]; doneIds: string[] }) {
  return (
    <div>
      {steps.map((s) => {
        const done = doneIds.includes(s.id);
        return (
          <div
            key={s.id}
            className="flex items-start gap-3.5 border-b border-linestone py-3 last:border-b-0"
          >
            <span
              className={
                done
                  ? "mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-forest text-sm text-white"
                  : "mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 border-gold bg-transparent text-sm"
              }
            >
              {done ? "✓" : ""}
            </span>
            <span>
              <span
                className={
                  done
                    ? "text-[15px] font-semibold text-muted-foreground line-through"
                    : "text-[15px] font-semibold"
                }
              >
                {s.title}
              </span>
              <br />
              <span className="text-[13.5px] text-muted-foreground">{s.detail}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Tab = "today" | "orders" | "shop" | "lab" | "support";

type ShopCheckout = {
  buyType: BuyType;
  productId?: string;
  sku?: string;
  prices?: PriceSet;
  productName?: string;
  addOn?: AddOnConfig | null;
  bundleAddOn?: AddOnConfig | null;
};

const cardClass =
  "mb-5 rounded-2xl border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)] sm:p-7";
const eyebrowClass = "tava-label";
const subClass = "text-[15px] leading-relaxed text-muted-foreground";
const mutedClass = "text-[13.5px] text-muted-foreground";
const h2Class = "mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep";

export default function AccountClient({ locale = "en" }: { locale?: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.account;
  const lh = (href: string) => localizeHref(href, locale);
  const LABELS: Record<string, Record<string, string>> = t.labelMaps;
  const STATUS_LABELS: readonly string[] = t.statusLabels;
  const AM_STEPS: StepItem[] = AM_STEP_IDS.map((id, i) => ({ id, title: t.amSteps[i].title, detail: t.amSteps[i].detail }));
  const PM_STEPS: StepItem[] = PM_STEP_IDS.map((id, i) => ({ id, title: t.pmSteps[i].title, detail: t.pmSteps[i].detail }));
  const [email, setEmail] = useState("");
  const [data, setData] = useState<WebAccountResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [checkout, setCheckout] = useState<ShopCheckout | null>(null);
  const moisturizerAddOn: AddOnConfig = {
    productId: "00bc6534-cd37-4015-a266-bedc75d69936",
    sku: "VASHO-PM-E5B5",
    name: "Peptide Moisturizer",
    blurb: dict.pairing.addonMoisturizerBlurb,
    price: 27.99,
  };
  const serumAddOn: AddOnConfig = {
    productId: "cbbc7de1-994e-45be-94d8-ac4be3b8cc18",
    sku: "VASHO-PBS-8FB6",
    name: "PDRN Brightening Serum",
    blurb: dict.pairing.addonSerumBlurb,
    price: 49,
  };
  // Time-of-day greeting and today's date label, read on the client
  // after mount (Next prerendering forbids reading the clock in render).
  const [greeting, setGreeting] = useState("");
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? t.greetings.morning : h < 17 ? t.greetings.afternoon : t.greetings.evening);
    setTodayLabel(
      now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    );
  }, []);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(async ({ data: sess }) => {
      const session = sess.session;
      if (!session) {
        window.location.href = lh("/login");
        return;
      }
      setEmail(session.user.email ?? "");
      try {
        const res = await fetch(WEB_ACCOUNT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: "{}",
        });
        if (res.status === 401) {
          window.location.href = lh("/login");
          return;
        }
        const json = (await res.json()) as WebAccountResponse;
        if (!json.ok) throw new Error("bad response");
        setData(json);
      } catch {
        setFailed(true);
      }
    });
  }, []);

  // Streak + program day, computed exactly like the app (AppStore):
  // a day counts when at least one session was finished that day.
  const computed = useMemo(() => {
    if (!data) return null;
    const byDay = new Map<string, Set<string>>();
    for (const s of data.routine_sessions) {
      if (!byDay.has(s.day)) byDay.set(s.day, new Set());
      byDay.get(s.day)!.add(s.session);
    }
    const active = (k: string) => (byDay.get(k)?.size ?? 0) > 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    const todayActive = active(dayKey(cursor));
    if (!todayActive) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (active(dayKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const programDay = Math.min(30, streak + (todayActive ? 0 : 1));
    const week: { label: string; on: boolean }[] = [];
    const names = t.weekInitials;
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      week.push({ label: names[d.getDay()], on: active(dayKey(d)) });
    }
    let bottleLine = "";
    if (data.details?.bottle_started_on) {
      const start = new Date(data.details.bottle_started_on + "T00:00:00");
      const used = Math.floor((new Date().setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0)) / 86400000);
      bottleLine = fmt(t.bottleSuffix, { days: Math.max(0, 30 - used) });
    }
    return { streak, programDay, week, bottleLine };
  }, [data]);

  async function signOut() {
    await supabase().auth.signOut();
    window.location.href = lh("/login");
  }

  const profile = data?.profile ?? null;
  const firstName = (profile?.name ?? "").split(" ")[0];
  const doneIds = (data?.routine_steps ?? []).map((s) => s.step_id);
  const answers = profile?.quiz_answers ?? null;
  const plan = profile?.plan ?? null;

  const chips: { label?: string; value: string }[] = [];
  if (answers?.goal) chips.push({ label: t.chipLabels.goal, value: LABELS.goal[answers.goal] ?? answers.goal });
  if (answers?.skinType) chips.push({ label: t.chipLabels.skinType, value: LABELS.skinType[answers.skinType] ?? answers.skinType });
  if (answers?.concern) chips.push({ label: t.chipLabels.concern, value: LABELS.concern[answers.concern] ?? answers.concern });
  if (answers?.sensitivity) chips.push({ value: LABELS.sensitivity[answers.sensitivity] ?? answers.sensitivity });
  if (answers?.routine) chips.push({ label: t.chipLabels.routine, value: LABELS.routine[answers.routine] ?? answers.routine });
  if (plan?.rampSchedule) chips.push({ label: t.chipLabels.plan, value: LABELS.ramp[plan.rampSchedule] ?? plan.rampSchedule });
  if (profile?.morning_time || profile?.night_time)
    chips.push({ label: t.chipLabels.routineTimes, value: `${profile.morning_time ?? "08:00"} / ${profile.night_time ?? "21:00"}` });

  const inlineLink =
    "font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4";

  return (
    <SiteShell locale={locale}>
      <section className="mx-auto w-full max-w-[55rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
        {email ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {t.signedInAs}{" "}
              <span className="font-semibold text-forest-deep">{email}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={signOut}
              className="font-semibold text-forest hover:bg-linen hover:text-forest"
            >
              {t.signOut}
            </Button>
          </div>
        ) : null}

        {!data && !failed ? (
          <div className={cardClass}>
            <p className={subClass}>{t.loading}</p>
          </div>
        ) : null}

        {failed ? (
          <div className={cardClass}>
            <h2 className="font-display text-2xl font-semibold text-forest-deep">
              {t.failedTitle}
            </h2>
            <p className={`${subClass} mt-2`}>
              {t.failedSegments.map((seg, i) =>
                seg.href ? (
                  <a key={i} className={inlineLink} href={seg.href}>
                    {seg.text}
                  </a>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </p>
            <Button
              className="mt-4 h-11 rounded-full px-6 text-[15px] font-semibold"
              type="button"
              onClick={() => window.location.reload()}
            >
              {t.tryAgain}
            </Button>
          </div>
        ) : null}

        {data && computed ? (
          <div>
            <div className="mb-5 flex flex-wrap gap-2" role="tablist">
              {(["today", "orders", "shop", "lab", "support"] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={
                    tab === t
                      ? "rounded-full bg-forest px-[18px] py-2.5 text-sm font-semibold text-gold-metal"
                      : "rounded-full border border-linestone bg-white px-[18px] py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold-soft"
                  }
                  type="button"
                  onClick={() => setTab(t)}
                >
                  {dict.account.tabs[t]}
                </button>
              ))}
            </div>

            {tab === "today" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{todayLabel}</p>
                  <h1 className="mt-1.5 font-display text-[1.875rem] leading-tight font-semibold text-forest-deep">
                    {greeting}
                    {firstName ? `, ${firstName}` : ""}
                  </h1>
                  <p className={`${subClass} mt-2`}>
                    {computed.streak > 0
                      ? fmt(t.streakLine, { streak: computed.streak, day: computed.programDay, bottle: computed.bottleLine })
                      : fmt(t.dayLine, { day: computed.programDay, bottle: computed.bottleLine })}
                  </p>
                  <div className="mt-3 flex gap-2">
                    {computed.week.map((d, i) => (
                      <div key={i} className="flex-1 text-center text-xs text-muted-foreground">
                        <div
                          className={
                            d.on
                              ? "mx-auto mb-1 flex size-[30px] items-center justify-center rounded-full bg-forest text-white"
                              : "mx-auto mb-1 flex size-[30px] items-center justify-center rounded-full border-2 border-linestone text-white"
                          }
                        >
                          {d.on ? "✓" : ""}
                        </div>
                        {d.label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <div className="h-2.5 overflow-hidden rounded-full bg-linen">
                      <div
                        className="h-full rounded-full bg-gold"
                        style={{ width: `${Math.max(4, Math.round((computed.programDay / 30) * 100))}%` }}
                      />
                    </div>
                    <p className={`${subClass} mt-2`}>
                      {fmt(t.progressLine, { day: computed.programDay, left: 30 - computed.programDay })}
                    </p>
                    <p className={`${subClass} mt-1`}>
                      {(() => {
                        const allSteps = [...AM_STEPS, ...PM_STEPS];
                        const doneToday = allSteps.filter((s) => doneIds.includes(s.id)).length;
                        const toGo = allSteps.length - doneToday;
                        return toGo > 0
                          ? fmt(t.stepsToGo, { n: toGo, total: allSteps.length })
                          : t.todayComplete;
                      })()}
                    </p>
                  </div>
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.planEyebrow}</p>
                  <h2 className={h2Class}>PDRN Brightening Serum</h2>
                  <p className={`${subClass} mt-2`}>
                    {plan?.summary ?? t.planDefault}
                  </p>
                  <div className="mt-3">
                    {chips.map((c, i) => (
                      <span
                        key={i}
                        className="mr-2 mb-2 inline-block rounded-full border border-gold-soft bg-paper px-3 py-1.5 text-[13px] text-forest-deep"
                      >
                        {c.label ? `${c.label} · ` : ""}
                        <b className="gold-word">{c.value}</b>
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 rounded-full border-forest px-4 font-semibold text-forest hover:bg-linen hover:text-forest"
                    render={<Link href={lh("/quiz")} />}
                  >
                    {plan?.summary ? t.retakeQuiz : t.takeQuiz}
                  </Button>
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.morningEyebrow}</p>
                  <h2 className={h2Class}>{t.amTitle}</h2>
                  <div className="mt-1.5">
                    <Steps steps={AM_STEPS} doneIds={doneIds} />
                  </div>
                </div>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.nightEyebrow}</p>
                  <h2 className={h2Class}>{t.pmTitle}</h2>
                  <div className="mt-1.5">
                    <Steps steps={PM_STEPS} doneIds={doneIds} />
                  </div>
                  <p className={`${mutedClass} mt-3`}>
                    {t.stepsNote}
                  </p>
                </div>
              </section>
            ) : null}

            {tab === "orders" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.ordersEyebrow}</p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-forest-deep">
                    {t.ordersTitle}
                  </h2>
                  {data.orders.length === 0 ? (
                    <p className={`${subClass} mt-2`}>
                      {t.ordersEmpty}
                    </p>
                  ) : (
                    <div className="mt-4">
                      {data.orders.map((o) => {
                        const total =
                          o.amount_total_cents != null
                            ? o.amount_total_cents / 100
                            : Number(o.total || 0);
                        return (
                          <div
                            key={o.id}
                            className="mb-3 rounded-2xl border border-linestone bg-paper px-5 py-4 last:mb-0"
                          >
                            <div className="flex flex-wrap justify-between gap-3">
                              <b>{o.order_number}</b>
                              <span className="flex flex-wrap items-center gap-1.5">
                                {o.payment_status === "paid" ? (
                                  <Badge>{t.paid}</Badge>
                                ) : o.payment_status === "failed" ? (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    {t.paymentFailed}
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    {t.unpaid}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className="border-gold-soft bg-paper text-forest"
                                >
                                  {STATUS_LABELS[o.status] ?? STATUS_LABELS[0]}
                                </Badge>
                                {o.is_subscription ? (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    {t.subscription}
                                  </Badge>
                                ) : null}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap justify-between gap-3">
                              <span>
                                {o.item} × {o.quantity}
                              </span>
                              <span>
                                <b>${total.toFixed(2)}</b> ·{" "}
                                {new Date(o.placed_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {o.tracking_number ? (
                              <span className={mutedClass}>
                                <br />
                                {o.carrier ?? t.carrierFallback} · {o.tracking_number}
                                {o.tracking_url ? (
                                  <>
                                    {" · "}
                                    <a
                                      className="font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                                      href={o.tracking_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {t.trackPackage}
                                    </a>
                                  </>
                                ) : null}
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.claimEyebrow}</p>
                  <h2 className={h2Class}>{t.claimTitle}</h2>
                  {data.claims.length > 0 ? (
                    <div className="mt-2">
                      {data.claims.map((c, i) => (
                        <div key={i}>
                          <p className={subClass}>
                            {c.orderNumber ? fmt(t.claimForOrder, { order: c.orderNumber }) : t.claimYourCode}
                            {c.expiresAt
                              ? fmt(t.claimValidUntil, { date: new Date(c.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) })
                              : ""}
                            {t.claimEnter}
                          </p>
                          <div className="mt-3 rounded-xl border-2 border-dashed border-gold bg-linen px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.12em] text-forest-deep">
                            {c.code}
                          </div>
                        </div>
                      ))}
                      <p className={`${subClass} mt-3`}>
                        {t.claimWebNote}
                      </p>
                    </div>
                  ) : (
                    <p className={`${subClass} mt-2`}>
                      {t.claimEmpty}
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {tab === "shop" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.shop.eyebrow}</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    {t.shop.title}
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    {t.shop.body}
                  </p>
                  <p className="mt-3.5">
                    <b>{t.shop.subscribeLine}</b>{t.shop.subscribeRest}
                  </p>
                  <p className="mt-1.5">
                    <b>{t.shop.oneTimeLine}</b>{t.shop.oneTimeRest}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button
                      className="h-12 rounded-full px-6 text-[15px] font-semibold"
                      type="button"
                      onClick={() => setCheckout({ buyType: "subscribe", addOn: moisturizerAddOn })}
                    >
                      {t.shop.subscribeBtn}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-forest px-6 text-[15px] font-semibold text-forest hover:bg-linen hover:text-forest"
                      type="button"
                      onClick={() => setCheckout({ buyType: "one_time", addOn: moisturizerAddOn })}
                    >
                      {t.shop.buyOnceBtn}
                    </Button>
                  </div>
                  <p className={`${mutedClass} mt-3.5`}>
                    {t.shop.stripeNote}
                  </p>
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.shop.moisturizerEyebrow}</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    Peptide Moisturizer
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    {t.shop.moisturizerBody}
                  </p>
                  <p className="mt-3.5">
                    <b>{t.shop.moisturizerLine}</b>{t.shop.moisturizerRest}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-forest px-6 text-[15px] font-semibold text-forest hover:bg-linen hover:text-forest"
                      type="button"
                      onClick={() =>
                        setCheckout({
                          buyType: "one_time",
                          productId: moisturizerAddOn.productId,
                          sku: moisturizerAddOn.sku,
                          prices: { one_time: 27.99 },
                          productName: "Peptide Moisturizer",
                          addOn: serumAddOn,
                        })
                      }
                    >
                      {t.shop.moisturizerBtn}
                    </Button>
                  </div>
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.shop.routineEyebrow}</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    {dict.pairing.routineTitle}
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    {t.shop.routineBody}
                  </p>
                  <p className="mt-3.5">
                    <b>{t.shop.routineLine}</b>{t.shop.routineRest}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button
                      className="h-12 rounded-full px-6 text-[15px] font-semibold"
                      type="button"
                      onClick={() =>
                        setCheckout({
                          buyType: "one_time",
                          productName: "PDRN Brightening Serum",
                          bundleAddOn: moisturizerAddOn,
                        })
                      }
                    >
                      {t.shop.routineBtn}
                    </Button>
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "lab" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.labTab.eyebrow}</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    {t.labTab.title}
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    {t.labTab.sub}
                  </p>
                </div>
                <LabPanels dict={dict} locale={locale} />
              </section>
            ) : null}

            {tab === "support" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>{t.support.eyebrow}</p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-forest-deep">
                    {t.support.title}
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    {t.support.segments.map((seg, i) =>
                      seg.href ? (
                        <a key={i} className={inlineLink} href={seg.href}>
                          {seg.text}
                        </a>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      ),
                    )}
                  </p>
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/contact#general")}>
                      {t.support.links.general}
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/contact#product-support")}>
                      {t.support.links.productSupport}
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/contact#sales-support")}>
                      {t.support.links.salesSupport}
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/faq")}>
                      {t.support.links.faqs}
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/shipping")}>
                      {t.support.links.shipping}
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href={lh("/returns")}>
                      {t.support.links.returns}
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </section>
      {checkout ? (
        <CheckoutModal
          buyType={checkout.buyType}
          initialEmail={email}
          onClose={() => setCheckout(null)}
          dict={dict}
          productId={checkout.productId}
          sku={checkout.sku}
          prices={checkout.prices}
          productName={checkout.productName}
          addOn={checkout.addOn}
          bundleAddOn={checkout.bundleAddOn}
        />
      ) : null}
    </SiteShell>
  );
}
