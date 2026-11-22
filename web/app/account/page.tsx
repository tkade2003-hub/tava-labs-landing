"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, SUPABASE_ANON_KEY, WEB_ACCOUNT_URL } from "@/lib/supabase";
import type { WebAccountResponse } from "@/lib/types";
import SiteShell from "@/components/SiteShell";
import LabPanels from "@/components/LabPanels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckoutModal, type BuyType } from "@/components/CheckoutModal";

// The signed-in web platform: an exact mirror of the mobile app's tabs —
// Today / Orders / Shop / Lab / Support — fed by the same backend data
// via the web-account edge function (verified email -> profile, plan,
// orders, routine history).

const AM_STEPS = [
  { id: "am-cleanse", title: "Cleanse", detail: "Gentle cleanser, pat dry" },
  { id: "am-serum", title: "Apply 3 drops of serum", detail: "Press into face and neck" },
  { id: "am-spf", title: "Moisturize + SPF", detail: "SPF 30 or higher" },
];
const PM_STEPS = [
  { id: "pm-cleanse", title: "Double cleanse", detail: "Remove SPF and makeup" },
  { id: "pm-serum", title: "Apply 3 drops of serum", detail: "Before retinol or treatments" },
  { id: "pm-moist", title: "Night moisturizer", detail: "Seal in hydration" },
];

const LABELS: Record<string, Record<string, string>> = {
  goal: { radiance: "Radiance", fine_lines: "Fine lines", hydration: "Hydration", even_tone: "Even tone" },
  skinType: { dry: "Dry", oily: "Oily", combination: "Combination", sensitive: "Sensitive", not_sure: "Not sure" },
  concern: { dullness: "Dullness", fine_lines: "Fine lines", uneven_tone: "Uneven tone", texture: "Texture", dryness: "Dryness" },
  sensitivity: { often: "Often sensitive", sometimes: "Sometimes sensitive", never: "Rarely sensitive" },
  routine: { cleanser_only: "Cleanser only", few_products: "A few products", full_routine: "Full routine" },
  ramp: { gentle: "Gentle ramp", standard: "Standard ramp", full: "Full strength" },
};
const STATUS_LABELS = ["Ordered", "Shipped", "Out for delivery", "Delivered"];

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function Steps({ steps, doneIds }: { steps: typeof AM_STEPS; doneIds: string[] }) {
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

const cardClass =
  "mb-5 rounded-2xl border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)] sm:p-7";
const eyebrowClass = "tava-label";
const subClass = "text-[15px] leading-relaxed text-muted-foreground";
const mutedClass = "text-[13.5px] text-muted-foreground";
const h2Class = "mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<WebAccountResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [buyType, setBuyType] = useState<BuyType | null>(null);
  // Time-of-day greeting and today's date label, read on the client
  // after mount (Next prerendering forbids reading the clock in render).
  const [greeting, setGreeting] = useState("");
  const [todayLabel, setTodayLabel] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setTodayLabel(
      now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    );
  }, []);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(async ({ data: sess }) => {
      const session = sess.session;
      if (!session) {
        window.location.href = "/login";
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
          window.location.href = "/login";
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
    const names = ["S", "M", "T", "W", "T", "F", "S"];
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
      bottleLine = ` · ${Math.max(0, 30 - used)} days left in bottle`;
    }
    return { streak, programDay, week, bottleLine };
  }, [data]);

  async function signOut() {
    await supabase().auth.signOut();
    window.location.href = "/login";
  }

  const profile = data?.profile ?? null;
  const firstName = (profile?.name ?? "").split(" ")[0];
  const doneIds = (data?.routine_steps ?? []).map((s) => s.step_id);
  const answers = profile?.quiz_answers ?? null;
  const plan = profile?.plan ?? null;

  const chips: { label?: string; value: string }[] = [];
  if (answers?.goal) chips.push({ label: "Goal", value: LABELS.goal[answers.goal] ?? answers.goal });
  if (answers?.skinType) chips.push({ label: "Skin type", value: LABELS.skinType[answers.skinType] ?? answers.skinType });
  if (answers?.concern) chips.push({ label: "Concern", value: LABELS.concern[answers.concern] ?? answers.concern });
  if (answers?.sensitivity) chips.push({ value: LABELS.sensitivity[answers.sensitivity] ?? answers.sensitivity });
  if (answers?.routine) chips.push({ label: "Routine", value: LABELS.routine[answers.routine] ?? answers.routine });
  if (plan?.rampSchedule) chips.push({ label: "Plan", value: LABELS.ramp[plan.rampSchedule] ?? plan.rampSchedule });
  if (profile?.morning_time || profile?.night_time)
    chips.push({ label: "Routine times", value: `${profile.morning_time ?? "08:00"} / ${profile.night_time ?? "21:00"}` });

  const inlineLink =
    "font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4";

  return (
    <SiteShell>
      <section className="mx-auto w-full max-w-[55rem] px-5 pt-10 pb-16 sm:px-8 lg:pt-14">
        {email ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-semibold text-forest-deep">{email}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={signOut}
              className="font-semibold text-forest hover:bg-linen hover:text-forest"
            >
              Sign out
            </Button>
          </div>
        ) : null}

        {!data && !failed ? (
          <div className={cardClass}>
            <p className={subClass}>Loading your account…</p>
          </div>
        ) : null}

        {failed ? (
          <div className={cardClass}>
            <h2 className="font-display text-2xl font-semibold text-forest-deep">
              We couldn&apos;t load your account
            </h2>
            <p className={`${subClass} mt-2`}>
              Check your connection and try again. If it keeps happening, email{" "}
              <a className={inlineLink} href="mailto:talia@tavalabs.app">
                talia@tavalabs.app
              </a>{" "}
              and we&apos;ll sort it out.
            </p>
            <Button
              className="mt-4 h-11 rounded-full px-6 text-[15px] font-semibold"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
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
                  {t === "today"
                    ? "Today"
                    : t === "orders"
                      ? "Orders"
                      : t === "shop"
                        ? "Shop"
                        : t === "lab"
                          ? "Lab"
                          : "Support"}
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
                      ? `${computed.streak} day streak · Day ${computed.programDay} of 30${computed.bottleLine}`
                      : `Day ${computed.programDay} of 30${computed.bottleLine}. Complete today's routine in the app to start your streak.`}
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
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>Your plan</p>
                  <h2 className={h2Class}>PDRN Brightening Serum</h2>
                  <p className={`${subClass} mt-2`}>
                    {plan?.summary ??
                      "Take the skin quiz, and your personal plan, built from your answers, will live here and in the app."}
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
                    render={<Link href="/quiz" />}
                  >
                    {plan?.summary ? "Retake the skin quiz" : "Take the skin quiz"}
                  </Button>
                </div>

                <div className={cardClass}>
                  <p className={eyebrowClass}>Morning routine</p>
                  <h2 className={h2Class}>AM · 3 drops</h2>
                  <div className="mt-1.5">
                    <Steps steps={AM_STEPS} doneIds={doneIds} />
                  </div>
                </div>
                <div className={cardClass}>
                  <p className={eyebrowClass}>Night routine</p>
                  <h2 className={h2Class}>PM · 3 drops</h2>
                  <div className="mt-1.5">
                    <Steps steps={PM_STEPS} doneIds={doneIds} />
                  </div>
                  <p className={`${mutedClass} mt-3`}>
                    You check off steps in the mobile app. This page shows today&apos;s routine
                    and what the app has recorded so far today.
                  </p>
                </div>
              </section>
            ) : null}

            {tab === "orders" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>Orders</p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-forest-deep">
                    Your orders
                  </h2>
                  {data.orders.length === 0 ? (
                    <p className={`${subClass} mt-2`}>
                      No orders yet. When you buy, your orders and tracking will show here and in
                      the app.
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
                                  <Badge>Paid</Badge>
                                ) : o.payment_status === "failed" ? (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    Payment failed
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    Unpaid
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className="border-gold-soft bg-paper text-forest"
                                >
                                  {STATUS_LABELS[o.status] ?? "Ordered"}
                                </Badge>
                                {o.is_subscription ? (
                                  <Badge
                                    variant="outline"
                                    className="border-gold-soft bg-paper text-forest"
                                  >
                                    Subscription
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
                                {o.carrier ?? "Carrier"} · {o.tracking_number}
                                {o.tracking_url ? (
                                  <>
                                    {" · "}
                                    <a
                                      className="font-medium text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                                      href={o.tracking_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Track package
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
                  <p className={eyebrowClass}>Claim code</p>
                  <h2 className={h2Class}>Linking a purchase to the app</h2>
                  {data.claims.length > 0 ? (
                    <div className="mt-2">
                      {data.claims.map((c, i) => (
                        <div key={i}>
                          <p className={subClass}>
                            Your claim code{c.orderNumber ? ` for order ${c.orderNumber}` : ""}
                            {c.expiresAt
                              ? ` (valid until ${new Date(c.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })})`
                              : ""}
                            . Enter it in the Tava app under Orders to link this purchase to your
                            app account:
                          </p>
                          <div className="mt-3 rounded-xl border-2 border-dashed border-gold bg-linen px-4 py-3 text-center font-mono text-xl font-bold tracking-[0.12em] text-forest-deep">
                            {c.code}
                          </div>
                        </div>
                      ))}
                      <p className={`${subClass} mt-3`}>
                        Here on the web you do not need the code. Signing in with your checkout
                        email already shows your orders and plan above.
                      </p>
                    </div>
                  ) : (
                    <p className={`${subClass} mt-2`}>
                      Bought through the quiz or this site? Your confirmation email and the page
                      right after checkout showed a claim code. Open the Tava mobile app, sign in,
                      and enter the code in the Orders tab. Your purchase, plan, and quiz answers
                      move into your app account. Here on the web, signing in with the same email
                      you checked out with already shows everything above. Nothing else to enter.
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {tab === "shop" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>PDRN Brightening Serum</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    The Science of Attractive Health
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    1 fl oz (30 ml). Reduce fine lines, hydrate deeply, restore radiance, and
                    strengthen skin. 2 to 4 pumps, morning and night.
                  </p>
                  <p className="mt-3.5">
                    <b>Subscribe, $39 per month.</b> A fresh bottle every month, automatically.
                  </p>
                  <p className="mt-1.5">
                    <b>One time, $49.</b> A single bottle.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button
                      className="h-12 rounded-full px-6 text-[15px] font-semibold"
                      type="button"
                      onClick={() => setBuyType("subscribe")}
                    >
                      Subscribe, $39 per month
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-forest px-6 text-[15px] font-semibold text-forest hover:bg-linen hover:text-forest"
                      type="button"
                      onClick={() => setBuyType("one_time")}
                    >
                      Buy once, $49
                    </Button>
                  </div>
                  <p className={`${mutedClass} mt-3.5`}>
                    Secure checkout by Stripe. You will confirm payment on Stripe&apos;s page.
                  </p>
                </div>
              </section>
            ) : null}

            {tab === "lab" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>Lab</p>
                  <h2 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
                    Know your numbers.
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    Real blood panels, ordered under your Tava account. Browse the panels, see
                    every marker before you order, and get your results delivered right here.
                  </p>
                </div>
                <LabPanels />
              </section>
            ) : null}

            {tab === "support" ? (
              <section>
                <div className={cardClass}>
                  <p className={eyebrowClass}>Support</p>
                  <h2 className="mt-1.5 font-display text-2xl font-semibold text-forest-deep">
                    We&apos;re here to help
                  </h2>
                  <p className={`${subClass} mt-2`}>
                    Email{" "}
                    <a className={inlineLink} href="mailto:talia@tavalabs.app">
                      talia@tavalabs.app
                    </a>{" "}
                    or call{" "}
                    <a className={inlineLink} href="tel:+19099061308">
                      909-906-1308
                    </a>
                    .
                  </p>
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/contact#general">
                      General questions
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/contact#product-support">
                      Product support
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/contact#sales-support">
                      Order &amp; sales support
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/faq">
                      FAQs
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/shipping">
                      Shipping policy
                    </Link>
                    <Link className="font-medium text-forest underline-offset-4 hover:underline" href="/returns">
                      Returns policy
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </section>
      {buyType ? (
        <CheckoutModal buyType={buyType} initialEmail={email} onClose={() => setBuyType(null)} />
      ) : null}
    </SiteShell>
  );
}
