"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LAB_PANELS } from "@/lib/labPanels";
import { callLabs, type LabOrderRow } from "@/lib/labs";

// The Lab tab panel catalog: real blood panels a signed in member can
// browse, with the full marker list per panel and its retail price from
// the labs function. Ordering opens once the lab checkout is attached;
// results will be delivered into this same tab.
const STEPS = [
  {
    n: "01",
    title: "Choose a panel",
    body: "Pick the panel that matches what you want to know. Every marker in it is listed before you order.",
  },
  {
    n: "02",
    title: "Physician review",
    body: "A licensed physician reviews and authorizes every order, so no separate doctor visit is needed.",
  },
  {
    n: "03",
    title: "Walk in for your draw",
    body: "One quick blood draw at a collection site near you. Most visits take about fifteen minutes.",
  },
  {
    n: "04",
    title: "Results land here",
    body: "Results are delivered digitally into this tab in days, with every marker and its range.",
  },
];

export default function LabPanels() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [orders, setOrders] = useState<LabOrderRow[] | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    callLabs("my_orders").then((res) => {
      setOrders(Array.isArray(res.orders) ? (res.orders as LabOrderRow[]) : []);
    });
    callLabs("catalog").then((res) => {
      const map: Record<string, number> = {};
      const panels = Array.isArray(res.panels) ? res.panels : [];
      for (const p of panels as { id?: string; priceCents?: number | null }[]) {
        if (p.id && typeof p.priceCents === "number") map[p.id] = p.priceCents;
      }
      setPrices(map);
    });
  }, []);

  return (
    <div>
      <div className="rounded-2xl border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)] sm:p-7">
        <p className="tava-label">Your lab orders</p>
        {orders === null ? (
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <>
            <h3 className="mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep">
              Nothing here yet
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              When you complete a panel, every marker lands here with its value, its healthy range,
              and how it moves over time. Order your first panel below and this space fills in.
            </p>
          </>
        ) : (
          <ul className="mt-3 divide-y divide-linestone">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-[15px] font-semibold text-forest-deep">{o.panel_name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {o.status.replace(/_/g, " ")}
                  </p>
                </div>
                <Link
                  href={`/account/lab/${o.id}`}
                  className="shrink-0 text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                >
                  View results
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)] sm:p-7">
        <p className="tava-label">How labs work</p>
        <h3 className="mt-1.5 font-display text-[1.375rem] font-semibold text-forest-deep">
          Four steps, one draw
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n}>
              <p
                className="text-[26px] leading-none font-black italic"
                style={{ fontFamily: "'Futura extra font','Futura',sans-serif", color: "#B78B45" }}
              >
                {s.n}
              </p>
              <p className="mt-2 text-[15px] font-semibold text-forest-deep">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="tava-label">The panels</p>
        <h3 className="mt-1.5 font-display text-[1.625rem] font-semibold text-forest-deep">
          Fourteen panels, built around what you track
        </h3>
        <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-muted-foreground">
          Every panel shows its price. Ordering opens once checkout is switched on, and a
          licensed physician reviews every order before your results are delivered right here.
          Panels cannot be ordered for addresses in New York, New Jersey, or Rhode Island.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {LAB_PANELS.map((panel) => {
          const open = openId === panel.id;
          return (
            <article
              key={panel.id}
              className="flex flex-col rounded-[22px] border border-linestone bg-white p-6 shadow-[0_10px_28px_rgba(8,37,29,0.07)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h4 className="font-display text-[1.375rem] leading-snug font-semibold text-forest-deep">
                  {panel.name}
                </h4>
                <span className="shrink-0 rounded-full bg-linen px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-forest-deep">
                  {panel.markerCount} markers
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {panel.description}
              </p>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className="text-[13px] font-medium text-forest">
                  {panel.collection} · Results in days
                </p>
                {prices[panel.id] ? (
                  <p className="font-display text-xl font-semibold text-forest-deep">
                    ${(prices[panel.id] / 100).toFixed(2)}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 border-t border-linestone pt-4">
                <button
                  type="button"
                  className="text-sm font-semibold text-forest underline decoration-gold-soft decoration-2 underline-offset-4"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : panel.id)}
                >
                  {open ? "Hide the markers" : "See the markers"}
                </button>
                {open ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Markers in ${panel.name}`}>
                    {panel.markers.map((m) => (
                      <li
                        key={m}
                        className="rounded-full bg-linen px-2.5 py-1 text-[12px] leading-tight text-forest-deep"
                      >
                        {m}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Lab insights are information about your own health and are not a diagnosis. Talk to your
        doctor about any result that concerns you, and call 911 in an emergency.
      </p>
    </div>
  );
}
