"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, SUPABASE_ANON_KEY, WEB_ACCOUNT_URL } from "@/lib/supabase";
import type { WebAccountResponse } from "@/lib/types";
import { PlatformHeader, PlatformFooter } from "@/components/Chrome";
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
          <div key={s.id} className={`p-step${done ? " done" : ""}`}>
            <span className={`p-check${done ? " done" : ""}`}>{done ? "✓" : ""}</span>
            <span>
              <span className="t">{s.title}</span>
              <br />
              <span className="d">{s.detail}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

type Tab = "today" | "orders" | "shop" | "lab" | "support";

export default function AppPage() {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<WebAccountResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [buyType, setBuyType] = useState<BuyType | null>(null);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(async ({ data: sess }) => {
      const session = sess.session;
      if (!session) {
        window.location.href = "login.html";
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
          window.location.href = "login.html";
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
    window.location.href = "login.html";
  }

  const profile = data?.profile ?? null;
  const firstName = (profile?.name ?? "").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
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

  return (
    <>
      <PlatformHeader email={email} onSignOut={signOut} />
      <main className="p-wrap">
        {!data && !failed ? (
          <div className="p-card">
            <p className="p-sub" style={{ margin: 0 }}>
              Loading your account…
            </p>
          </div>
        ) : null}

        {failed ? (
          <div className="p-card">
            <h2 className="p-title" style={{ fontSize: 24 }}>
              We couldn&apos;t load your account
            </h2>
            <p className="p-sub">
              Check your connection and try again. If it keeps happening, email{" "}
              <a href="mailto:talia@tavalabs.app">talia@tavalabs.app</a> and we&apos;ll sort it out.
            </p>
            <button className="p-btn" type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : null}

        {data && computed ? (
          <div>
            <div className="p-tabs" role="tablist">
              {(["today", "orders", "shop", "lab", "support"] as Tab[]).map((t) => (
                <button
                  key={t}
                  className={`p-tab${tab === t ? " active" : ""}`}
                  type="button"
                  onClick={() => setTab(t)}
                >
                  {t === "today" ? "Today" : t === "orders" ? "Orders" : t === "shop" ? "Shop" : t === "lab" ? "Lab" : "Support"}
                </button>
              ))}
            </div>

            {tab === "today" ? (
              <section>
                <div className="p-card">
                  <p className="p-eyebrow">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <h1 className="p-title">
                    {greeting}
                    {firstName ? `, ${firstName}` : ""}
                  </h1>
                  <p className="p-sub">
                    {computed.streak > 0
                      ? `${computed.streak}-day streak · Day ${computed.programDay} of 30${computed.bottleLine}`
                      : `Day ${computed.programDay} of 30${computed.bottleLine} — complete today's routine in the app to start your streak.`}
                  </p>
                  <div className="p-week">
                    {computed.week.map((d, i) => (
                      <div key={i} className={`p-day${d.on ? " on" : ""}`}>
                        <div className="dot">{d.on ? "✓" : ""}</div>
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-card">
                  <p className="p-eyebrow">Your plan</p>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Glow Brightening Serum</h2>
                  <p className="p-sub">
                    {plan?.summary ??
                      "Take the skin quiz and your personal plan — built from your answers — will live here and in the app."}
                  </p>
                  <div>
                    {chips.map((c, i) => (
                      <span key={i} className="p-chip">
                        {c.label ? `${c.label} · ` : ""}
                        <b>{c.value}</b>
                      </span>
                    ))}
                  </div>
                  <a className="p-btn secondary small" href="quiz.html">
                    {plan?.summary ? "Retake the skin quiz" : "Take the skin quiz"}
                  </a>
                </div>

                <div className="p-card">
                  <p className="p-eyebrow">Morning routine</p>
                  <h2 style={{ margin: "0 0 6px", fontSize: 22 }}>AM — 3 drops</h2>
                  <Steps steps={AM_STEPS} doneIds={doneIds} />
                </div>
                <div className="p-card">
                  <p className="p-eyebrow">Night routine</p>
                  <h2 style={{ margin: "0 0 6px", fontSize: 22 }}>PM — 3 drops</h2>
                  <Steps steps={PM_STEPS} doneIds={doneIds} />
                  <p className="p-muted" style={{ marginTop: 12 }}>
                    Check-offs are tracked in the mobile app — this web view shows today&apos;s
                    routine and what the app has recorded so far today.
                  </p>
                </div>
              </section>
            ) : null}

            {tab === "orders" ? (
              <section>
                <div className="p-card">
                  <p className="p-eyebrow">Orders</p>
                  <h2 className="p-title" style={{ fontSize: 24 }}>
                    Your orders
                  </h2>
                  {data.orders.length === 0 ? (
                    <p className="p-sub">
                      No orders yet — when you buy, your orders and tracking will show here and in
                      the app.
                    </p>
                  ) : (
                    data.orders.map((o) => {
                      const total =
                        o.amount_total_cents != null ? o.amount_total_cents / 100 : Number(o.total || 0);
                      return (
                        <div key={o.id} className="p-order">
                          <div className="row">
                            <b>{o.order_number}</b>
                            <span>
                              {o.payment_status === "paid" ? (
                                <span className="p-badge">Paid</span>
                              ) : o.payment_status === "failed" ? (
                                <span className="p-badge light">Payment failed</span>
                              ) : (
                                <span className="p-badge light">Unpaid</span>
                              )}{" "}
                              <span className="p-badge light">{STATUS_LABELS[o.status] ?? "Ordered"}</span>
                              {o.is_subscription ? (
                                <>
                                  {" "}
                                  <span className="p-badge light">Subscription</span>
                                </>
                              ) : null}
                            </span>
                          </div>
                          <div className="row">
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
                            <span className="p-muted">
                              <br />
                              {o.carrier ?? "Carrier"} · {o.tracking_number}
                              {o.tracking_url ? (
                                <>
                                  {" · "}
                                  <a href={o.tracking_url} target="_blank" rel="noopener noreferrer">
                                    Track package
                                  </a>
                                </>
                              ) : null}
                            </span>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-card">
                  <p className="p-eyebrow">Claim code</p>
                  <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Linking a purchase to the app</h2>
                  {data.claims.length > 0 ? (
                    <div>
                      {data.claims.map((c, i) => (
                        <div key={i}>
                          <p className="p-sub">
                            Your claim code{c.orderNumber ? ` for order ${c.orderNumber}` : ""}
                            {c.expiresAt
                              ? ` (valid until ${new Date(c.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })})`
                              : ""}{" "}
                            — enter it in the Tava app under Orders to link this purchase to your
                            app account:
                          </p>
                          <div className="p-code">{c.code}</div>
                        </div>
                      ))}
                      <p className="p-sub" style={{ marginTop: 12 }}>
                        Here on the web you don&apos;t need the code — signing in with your checkout
                        email already shows your orders and plan above.
                      </p>
                    </div>
                  ) : (
                    <p className="p-sub">
                      Bought through the quiz or this site? Your confirmation email and the page
                      right after checkout showed a claim code. Open the Tava mobile app, sign in,
                      and enter the code in the Orders tab — your purchase, plan, and quiz answers
                      move into your app account. Here on the web, signing in with the same email
                      you checked out with already shows everything above — nothing else to enter.
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {tab === "shop" ? (
              <section>
                <div className="p-card">
                  <p className="p-eyebrow">Glow Brightening Serum</p>
                  <h2 className="p-title" style={{ fontSize: 26 }}>
                    The Science of Attractive Health
                  </h2>
                  <p className="p-sub">
                    1 fl oz (30 ml). Reduce fine lines, hydrate deeply, restore radiance, strengthen
                    skin. 2–4 pumps, morning and night.
                  </p>
                  <p style={{ margin: "0 0 6px" }}>
                    <b>Subscribe — $39/month.</b> A fresh bottle every month, automatically.
                  </p>
                  <p style={{ margin: "0 0 16px" }}>
                    <b>One-time — $49.</b> A single bottle.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="p-btn" type="button" onClick={() => setBuyType("subscribe")}>
                      Subscribe — $39/month
                    </button>
                    <button className="p-btn secondary" type="button" onClick={() => setBuyType("one_time")}>
                      Buy once — $49
                    </button>
                  </div>
                  <p className="p-muted" style={{ marginTop: 14 }}>
                    Secure checkout by Stripe — you&apos;ll confirm payment on Stripe&apos;s page.
                  </p>
                </div>
              </section>
            ) : null}

            {tab === "lab" ? (
              <section>
                <div className="p-card">
                  <p className="p-eyebrow">
                    Lab <span className="p-soon">· Coming soon</span>
                  </p>
                  <h2 className="p-title" style={{ fontSize: 26 }}>
                    Insights
                  </h2>
                  <p className="p-sub">
                    Biomarker insights are being built into Tava — this is the layout they&apos;ll
                    arrive in: an overview ring for all your biomarkers, then a card per area with
                    what needs attention. No results yet — when Lab launches, your real results
                    will fill this in.
                  </p>
                  <div className="p-ring-wrap">
                    <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden="true">
                      <circle cx="85" cy="85" r="70" fill="none" stroke="#E7DFCE" strokeWidth="13" />
                      <circle cx="85" cy="85" r="70" fill="none" stroke="#123B2C" strokeWidth="13" strokeLinecap="round" strokeDasharray="290 440" transform="rotate(-90 85 85)" opacity=".45" />
                      <circle cx="85" cy="85" r="70" fill="none" stroke="#B78B45" strokeWidth="13" strokeLinecap="round" strokeDasharray="60 440" strokeDashoffset="-300" transform="rotate(-90 85 85)" opacity=".45" />
                      <circle cx="85" cy="85" r="70" fill="none" stroke="#C08552" strokeWidth="13" strokeLinecap="round" strokeDasharray="40 440" strokeDashoffset="-370" transform="rotate(-90 85 85)" opacity=".45" />
                      <text x="85" y="90" textAnchor="middle" fontSize="13" fill="#6B7268">
                        All biomarkers
                      </text>
                    </svg>
                    <div>
                      <p style={{ margin: "0 0 10px" }}>
                        <span className="p-muted">Optimal</span>
                        <br />
                        <b style={{ fontSize: 22 }}>—</b>
                      </p>
                      <p style={{ margin: "0 0 10px" }}>
                        <span className="p-muted">In range</span>
                        <br />
                        <b style={{ fontSize: 22 }}>—</b>
                      </p>
                      <p style={{ margin: 0 }}>
                        <span className="p-muted">Out of range</span>
                        <br />
                        <b style={{ fontSize: 22 }}>—</b>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-card">
                  <div className="p-cat">
                    <div>
                      <b>Skin Health</b>
                      <br />
                      <span className="p-muted">— biomarkers impacted</span>
                    </div>
                    <span className="p-soon">Preview</span>
                  </div>
                  <div className="p-cat">
                    <div>
                      <b>Hydration &amp; Barrier</b>
                      <br />
                      <span className="p-muted">— biomarkers impacted</span>
                    </div>
                    <span className="p-soon">Preview</span>
                  </div>
                  <div className="p-cat" style={{ marginBottom: 0 }}>
                    <div>
                      <b>Metabolic Health</b>
                      <br />
                      <span className="p-muted">— biomarkers impacted</span>
                    </div>
                    <span className="p-soon">Preview</span>
                  </div>
                </div>
              </section>
            ) : null}

            {tab === "support" ? (
              <section>
                <div className="p-card">
                  <p className="p-eyebrow">Support</p>
                  <h2 className="p-title" style={{ fontSize: 24 }}>
                    We&apos;re here to help
                  </h2>
                  <p className="p-sub">
                    Email <a href="mailto:talia@tavalabs.app">talia@tavalabs.app</a> or call{" "}
                    <a href="tel:+19099061308">909-906-1308</a>.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <a href="contact.html#general">General questions</a>
                    <a href="contact.html#product-support">Product support</a>
                    <a href="contact.html#sales-support">Order &amp; sales support</a>
                    <a href="faq.html">FAQs</a>
                    <a href="shipping.html">Shipping policy</a>
                    <a href="returns.html">Returns policy</a>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </main>
      <PlatformFooter />
      {buyType ? (
        <CheckoutModal buyType={buyType} initialEmail={email} onClose={() => setBuyType(null)} />
      ) : null}
    </>
  );
}
