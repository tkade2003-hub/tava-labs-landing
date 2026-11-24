"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LAB_PANELS } from "@/lib/labPanels";
import { callLabs, type LabOrderRow } from "@/lib/labs";
import { EN_DICT, type Dict } from "@/lib/i18n/dictionaries";
import { fmt, localizeHref, type Locale } from "@/lib/i18n/config";

// The Lab tab panel catalog in the dark clinical style: real blood
// panels a signed in member can browse, with the full marker list per
// panel and its retail price from the labs function. Ordering opens
// once the lab checkout is attached; results are delivered into this
// same tab.
const STEP_NUMBERS = ["01", "02", "03", "04"];

const tile =
  "rounded-[28px] border border-white/[0.07] bg-white/[0.055] p-6 sm:p-7";

export default function LabPanels({ dict = EN_DICT, locale = "en" }: { dict?: Dict; locale?: Locale }) {
  const t = dict.lab;
  const lh = (href: string) => localizeHref(href, locale);
  const dateLocale = locale === "en" ? "en-US" : locale;
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
    <div className="rounded-[32px] bg-[#17100D] p-4 shadow-[0_18px_44px_rgba(23,16,13,0.35)] sm:p-6">
      <div className="flex flex-col gap-4">
        <div className={tile}>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-champagne uppercase">
            {t.ordersLabel}
          </p>
          <h3 className="mt-2 text-[1.625rem] leading-tight font-semibold text-white">
            {t.ordersTitle}
          </h3>
          {orders === null ? (
            <p className="mt-2 text-[15px] leading-relaxed text-white/65">{t.loadingOrders}</p>
          ) : orders.length === 0 ? (
            <>
              <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-white/70">
                {t.ordersEmpty}
              </p>
            </>
          ) : (
            <ul className="mt-3 divide-y divide-white/10">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-[15px] font-semibold text-white">{o.panel_name}</p>
                    <p className="text-[13px] text-white/55">
                      {new Date(o.created_at).toLocaleDateString(dateLocale, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {o.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Link
                    href={lh(`/account/lab/${o.id}`)}
                    className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-champagne underline decoration-champagne/60 decoration-2 underline-offset-4"
                  >
                    {t.viewResults}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={tile}>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-champagne uppercase">
            {t.howLabel}
          </p>
          <h3 className="mt-2 text-[1.375rem] font-semibold text-white">{t.howTitle}</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEP_NUMBERS.map((n, i) => (
              <div key={n}>
                <p
                  className="text-[26px] leading-none font-black italic"
                  style={{ fontFamily: "'Futura extra font','Futura',sans-serif", color: "#D8C19A" }}
                >
                  {n}
                </p>
                <p className="mt-2 text-[15px] font-semibold text-white">{t.steps[i].title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{t.steps[i].body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-1 pt-2">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-champagne uppercase">
            {t.panelsLabel}
          </p>
          <h3 className="mt-2 text-[1.625rem] leading-tight font-semibold text-white">
            {t.panelsTitle}
          </h3>
          <p className="mt-2 max-w-[42rem] text-[15px] leading-relaxed text-white/70">
            {t.panelsSub}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {LAB_PANELS.map((panel) => {
            const open = openId === panel.id;
            const loc = t.panelsById[panel.id as keyof typeof t.panelsById];
            const panelName = loc?.name ?? panel.name;
            const panelDesc = loc?.description ?? panel.description;
            const panelCollection = loc?.collection ?? panel.collection;
            return (
              <article
                key={panel.id}
                className="flex flex-col rounded-[24px] border border-white/[0.07] bg-white/[0.055] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-[1.375rem] leading-snug font-semibold text-white">
                    {panelName}
                  </h4>
                  <span className="shrink-0 rounded-full bg-champagne px-3 py-1 text-[12px] font-semibold whitespace-nowrap text-[#2A1710]">
                    {fmt(t.markersSuffix, { n: panel.markerCount })}
                  </span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-white/70">
                  {panelDesc}
                </p>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <p className="text-[13px] font-medium text-champagne">
                    {panelCollection} · {t.resultsInDays}
                  </p>
                  {prices[panel.id] ? (
                    <p className="text-xl font-semibold text-white">
                      ${(prices[panel.id] / 100).toFixed(2)}
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-champagne underline decoration-champagne/60 decoration-2 underline-offset-4"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : panel.id)}
                  >
                    {open ? t.hideMarkers : t.seeMarkers}
                  </button>
                  {open ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={fmt(t.markersAria, { name: panelName })}>
                      {panel.markers.map((m) => (
                        <li
                          key={m}
                          className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] leading-tight text-white/85"
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

        <p className="px-1 text-sm leading-relaxed text-white/55">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
